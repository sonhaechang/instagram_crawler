import os
import re
import time
import traceback
import threading
from queue import Empty

from datetime import datetime, timedelta

from typing import Optional

from bs4 import BeautifulSoup as bs

from seleniumwire import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from instagram_crawling.utils import scroll_up, scroll_down
from instagram_crawling.meta_data import (
    POST_A_TAG, 
    CRAWLING_RESULT_DIR, 
    HASH_TAG_TITLE_TAG, 
    BLACK_LIST_PATH,
)
from instagram_crawling.excel_import_export import (
    import_excel, 
    export_excel, 
    update_excel,
)
from instagram_crawling.utils import (
    duplicate_count, 
    clean_instagram_url,
    scroll_to_get_all_comments,
    click_all_show_replies_btns,
    is_instagram_blocked,
    load_blacklist,
    filter_hashtags,
)


class ExtractHander:
    def __init__(
        self, 
        driver: webdriver.Chrome,
        command_queue,
        response_queue
    ) -> None:
        self.driver: webdriver.Chrome = driver
        self.command_queue = command_queue
        self.response_queue = response_queue
        self._stop_signal = False
        self._stop_listener_running = False
        self.black_list = load_blacklist(BLACK_LIST_PATH)

    def stop_listener(self):
        if self._stop_listener_running:
            return
        
        self._stop_listener_running = True
        threading.Thread(target=self._check_stop_signal, daemon=True).start()

    def _check_stop_signal(self):
        print('start _check_stop_signal method')
        while self._stop_listener_running:
            try:
                msg = self.command_queue.get(timeout=1)

                if msg['channel'] == 'extractStop':
                    print('크롤링이 성공적으로 중단 되었습니다.')
                    self._stop_signal = True
                    break

                if msg['channel'] == 'extractFinish':
                    break
            except Empty:
                continue
    
    def _stop_response(self):
        self.response_queue.put({
            'status': 200,
            'channel': 'extractStop',
            'data': {
                'type': 'msg',
                'data': '크롤링이 성공적으로 중단 되었습니다.'
            }
        })

    def collect_all_post_urls(
        self,
        hashtag: str, 
        start_time: float,
		max_no_new_count: int = 5, 
		lazy_trigger_threshold: int = 2
    ) -> str:
        """
        Instagram 해시태그 페이지에서 스크롤을 반복하며 모든 게시글 URL을 수집하는 함수.
        게시글이 더 이상 새로 로드되지 않을 때까지 스크롤하며 수집을 반복함.
        lazy-load 보완을 위해 조건부로 스크롤을 위로 올렸다 다시 내리는 트릭을 활용함.

        Args:
            driver (WebDriver): Selenium 브라우저 객체
            hashtag (str): 
            max_no_new_count (int): 새 게시물이 감지되지 않은 횟수가 이 숫자 이상이면 종료
            lazy_trigger_threshold (int): 연속으로 새 게시물이 감지되지 않은 횟수가 이 숫자 이상일 때 lazy-load 유도 스크롤을 실행

        Returns:
            list[str]: 수집된 게시글의 고유 URL 리스트
        """

        try:

            time.sleep(1)

            self.stop_listener()

            post_urls = set()
            no_new_count = 0

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': '인스타그램 스크롤 기반 게시물 수집 시작...'
                }
            })

            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, POST_A_TAG))
            )

            while True:
                if self._stop_signal:
                    self._stop_response()
                    break

                anchors = self.driver.find_elements(By.CSS_SELECTOR, POST_A_TAG)
                before_count = len(anchors)
                last_elem = anchors[-1] if anchors else None

                # 기본 스크롤 ↓
                scroll_down(self.driver)
                time.sleep(2)

                # 조건부 lazy-load 유도
                if no_new_count >= lazy_trigger_threshold:
                    self.response_queue.put({
                        'status': 200, 
                        'channel': 'extract',
                        'data': {
                            'type': 'msg', 
                            'data': 'lazy-load 유도 스크롤 실행'
                        }
                    })

                    if self._stop_signal:
                        self._stop_response()
                        break

                    scroll_up(self.driver)
                    time.sleep(1)

                    scroll_down(self.driver)
                    time.sleep(1)

                if self._stop_signal:
                    self._stop_response()
                    break

                # staleness 감지 (가능한 경우)
                if last_elem:
                    try:
                        WebDriverWait(self.driver, 8).until(EC.staleness_of(last_elem))
                    except:
                        self.response_queue.put({
                            'status': 200, 
                            'channel': 'extract',
                            'data': {
                                'type': 'msg', 
                                'data': 'staleness 감지 실패 → 게시물 수 비교로 fallback'
                            }
                        })

                # fallback: 게시물 수 변화 확인
                for _ in range(10):
                    current_anchors = self.driver.find_elements(By.CSS_SELECTOR, POST_A_TAG)

                    if len(current_anchors) > before_count:
                        break
                    time.sleep(1)

                # 새롭게 보이는 게시글 링크 수집
                current_anchors = self.driver.find_elements(By.CSS_SELECTOR, POST_A_TAG)
                new_links = []
                
                for a in current_anchors:
                    href = a.get_attribute('href')

                    if href:
                        href = clean_instagram_url(href)

                        if '/p/' in href:
                            new_links.append(href)

                prev_total = len(post_urls)
                post_urls.update(new_links)
                new_count = len(post_urls) - prev_total

                # print(f'새로 수집된: {new_count}개 / 누적 총: {len(post_urls)}', flush=True)

                if new_count == 0:
                    no_new_count += 1
                    self.response_queue.put({
                        'status': 200, 
                        'channel': 'extract',
                        'data': {
                            'type': 'msg', 
                            'data': f'새 게시물 없음 ({no_new_count}/{max_no_new_count})'
                        }
                    })
                else:
                    no_new_count = 0
                    self.response_queue.put({
                        'status': 200, 
                        'channel': 'extract',
                        'data': {
                            'type': 'msg', 
                            'data': f'새로 수집된: {new_count}개 / 누적 총: {len(post_urls)}'
                        }
                    })

                if no_new_count >= max_no_new_count:
                    self.response_queue.put({
                        'status': 200, 
                        'channel': 'extract',
                        'data': {
                            'type': 'msg', 
                            'data': '더 이상 게시물이 로드되지 않아 종료합니다.'
                        }
                    })

                    break

            date = datetime.today().strftime('%Y%m%d')
            file_path = os.path.join(CRAWLING_RESULT_DIR, f'{hashtag}_{date}.xlsx')		
            export_excel(hashtag, 'post_url', post_urls, file_path)

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': f'최종 수집 완료: 총 {len(post_urls)}개 게시글 URL 확보됨'
                }
            })

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': f'소요시간: {timedelta(seconds=(time.time() - start_time))}'
                }
            })

            return file_path
        except:
            self.response_queue.put({
                'status': 500, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': '처리중 문제가 발생 - 다시 시도해주세요.\n 문제가 지속된다면 개발자에게 문의해주세요.'
                }
            })
            return None
        finally:
            self._stop_listener_running = False
            self._stop_signal = False
    
    def collect_all_hashtags(
        self, 
        file_name: str, 
        ectract: int, 
        start_time: float,
        file_path: Optional[str] = None
    ) -> None:
        ''' 게시글에서 해쉬태그 추출하는 함수 '''

        time.sleep(1)

        self.stop_listener()

        self.response_queue.put({
            'status': 200, 
            'channel': 'extract',
            'data': {
                'type': 'msg', 
                'data': '게시글에서 해쉬태그 추출 시작합니다.'
            }
        })

        time.sleep(0.1)

        self.response_queue.put({
            'status': 200, 
            'channel': 'extract',
            'data': {
                'type': 'msg', 
                'data': '게시글 양에 따라 시간이 오래 걸릴 수 있습니다.'
            }
        })

        try:            
            # 해쉬태그 추출 시작: 파일 경로가 인자값으로 있으면 그냥 사용 없으면 파일명을 이용하여 파일 경로 생성
            file_path = os.path.join(CRAWLING_RESULT_DIR, file_name) if file_path is None else file_path 

            # 게시글 url 엑셀파일명에서 해쉬태그 추출
            hash_tag = file_path.split('/')[-1].split('_')[0]

            # url 주소가 저장된 엑셀 파일을 읽어오기
            excel_result = import_excel(file_path, 'post_url')

            # 추출횟수 가져오기 (없다면 0)
            extract_count = excel_result['extract_count'] if bool(excel_result) else 0
            
            # 게시글 url 목록 가져오기 (없다면 빈 list)
            post_urls = excel_result['results'] if bool(excel_result) else list()

            # 게시글 url 수 계산
            post_urls_num = len(post_urls)

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': f'총 게시글 url: {post_urls_num}개 / 추출된 url: {extract_count}개  / 남은 url: {post_urls_num - extract_count}개'
                }
            })

            time.sleep(0.1)

            # 게시글 갯수와 추출횟수가 같을때
            if int(post_urls_num) == int(extract_count):
                self.response_queue.put({
                    'status': 400, 
                    'channel': 'extract',
                    'data': {
                        'type': 'msg', 
                        'data': '해당 게시글 url 엑셀은 이미 추출이 완료되었습니다. \n 다시 추출을 원하시면 해당 엑셀 파일의 해쉬태그 추출 횟수를 0을 저장 후 다시 시도해주세요.'
                    }
                })

                time.sleep(0.1)

                self.response_queue.put({
                    'status': 200, 
                    'channel': 'extract',
                    'data': {'type': 'is_extract_finish', 'data': True}
                })

                return False

            post_count = 0

            # 마지막으로 추출한 게시글 url 있으면 다음꺼부터 이어서 해쉬태그 추출 아니면 처음부터
            for url in post_urls[extract_count:]:
                if self._stop_signal:
                    self._stop_response()
                    break

                self.response_queue.put({
                    'status': 200, 
                    'channel': 'extract',
                    'data': {
                        'type': 'msg', 
                        'data': f'{(extract_count + 1)}번째 url 추출 중 / 총 게시글 url: {post_urls_num}개 / 남은 url: {post_urls_num - extract_count}개'
                    }
                })

                time.sleep(5)

                if self._stop_signal:
                    self._stop_response()
                    break

                # 결과값을 저장할 빈 list와 dict 선언
                tag_list = list()
                tag_dict = dict()

                # 해당 url에 게시글 상세 페이지 읽어오기
                self.driver.get(url)

                # 200 정상 응답이 오면 해쉬태그 추출해서 리스트에 추가
                if self.driver.requests[0].response.status_code == 200:
                    scroll_to_get_all_comments(self.driver)
                    click_all_show_replies_btns(self.driver)

                    html = self.driver.page_source
                    soup = bs(html, 'html.parser')

                    if is_instagram_blocked(html, soup):
                        self.response_queue.put({
                            'status': 400, 
                            'channel': 'extract',
                            'data': {
                                'type': 'msg', 
                                'data': '인스타그램 차단됨 - 잠시 후 다시 시도해주세요.\n 문제가 지속된다면 개발자에게 문의해주세요.'
                            }
                        })

                        time.sleep(0.1)

                        self.response_queue.put({
                            'status': 200, 
                            'channel': 'extract',
                            'data': {
                                'type': 'is_extract_finish', 
                                'data': True
                            }
                        })

                        return False

                    tag_results = [a.get_text(strip=True) for a in soup.select(HASH_TAG_TITLE_TAG)]
                    joined_tags = ' '.join(tag_results)
                    pure_tags = list(re.findall('#[A-Za-z0-9가-힣]+', joined_tags))
                    filtered_tags = filter_hashtags(pure_tags, self.black_list)

                    # tag_list += list(filter(check_black_list, re.findall('#[A-Za-z0-9가-힣]+', joined_tag)))
                    tag_list += filtered_tags

                    self.response_queue.put({
                        'status': 200, 
                        'channel': 'extract',
                        'data': {
                            'type': 'msg', 
                            'data': f'{len(pure_tags)}개의 해시태그를 수집'
                        }
                    })

                    extract_count += 1
                    post_count += 1

                    # 게시글 url 엑셀 파일에 태그 추출 횃수 업데이트
                    update_excel(file_path, 'post_url', extract_count)

                    # 해쉬태그 결과 엑셀 파일에서 내용 읽어오기
                    _excel_result = import_excel(file_path, 'tag_name')

                    # 엑셀 파일 있을시 (기존 해쉬태그 결과 엑셀 파일이 존재할떄)
                    if bool(_excel_result):
                        _tag_result = _excel_result['results']

                        # 기존 해쉬태그 결과 추가하기
                        tag_dict.update(_tag_result)

                        # 해쉬태그 중복 카운트
                        duplicate_count(tag_list, tag_dict)

                        # 엑셀에 결과 업데이트
                        update_excel(file_path, 'tag_name', len(tag_dict), tag_dict)

                    # 엑셀 파일 없을시
                    else:
                        # 해쉬태그 중복 카운트
                        duplicate_count(tag_list, tag_dict)

                        # 결과 엑셀로 생성
                        export_excel(hash_tag, 'tag_name', tag_dict, file_path)

                    # pbar.update(1)

                    if post_count >= int(ectract):
                        self.response_queue.put({
                            'status': 200, 
                            'channel': 'extract',
                            'data': {
                                'type': 'msg', 
                                'data': f'인스타그램 봇 차단 방지를 위해서 게시글 {ectract}개 까지만 확인합니다.'
                            }
                        })

                        time.sleep(0.1)

                        self.response_queue.put({
                            'status': 200, 
                            'channel': 'extract',
                            'data': {
                                'type': 'is_extract_finish', 
                                'data': True
                            }
                        })

                        break
                else:
                    # 정상 응답이 아니면 extract_error 변수값 True려 변경 후 for문 종료
                    self.response_queue.put({
                        'status': 400, 
                        'channel': 'extract',
                        'data': {
                            'type': 'msg', 
                            'data': '인스타그램 차단됨 - 잠시 후 다시 시도해주세요.\n 문제가 지속된다면 개발자에게 문의해주세요.'
                        }
                    })

                    time.sleep(0.1)

                    self.response_queue.put({
                        'status': 200, 
                        'channel': 'extract',
                        'data': {
                            'type': 'is_extract_finish', 
                            'data': True
                        }
                    })

                    break

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': '게시글에서 해쉬태그 추출이 완료 되었습니다.'
                }
            })

            time.sleep(0.1)
        except Exception as e:
            traceback.print_exc()
            time.sleep(0.1)
        finally:
            self._stop_listener_running = False
            self._stop_signal = False
            self.command_queue.put({'channel': 'extractFinish'})

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'msg', 
                    'data': f'소요시간: {timedelta(seconds=(time.time() - start_time))}'
                }
            })

            time.sleep(0.1)

            self.response_queue.put({
                'status': 200, 
                'channel': 'extract',
                'data': {
                    'type': 'is_extract_finish', 
                    'data': True
                }
            })