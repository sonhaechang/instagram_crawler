import datetime
import json
import os
import psutil
import shutil
import time
import traceback
from typing import Optional

from bs4 import BeautifulSoup

from seleniumwire import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from instagram_crawling.driver import Driver

from instagram_crawling.meta_data import (
	BASE_URL,
	LOGIN_URL,
	BASE_PROFILE_DIR,
	SEARHC_BUTTON, 
	SEARCH_INPUT,
	FIRST_SEARCH_RESULT,
	TOTAL_POST_COUNT, 
	SHOW_REPLIES_BTN,
	SCROLL_UP, 
	SCROLL_DOWN, 
	SCROLL_POSITION,
)


def get_today_profile_path() -> str:
	today = datetime.date.today().isoformat()
	return os.path.join(BASE_PROFILE_DIR, today)


def cleanup_old_profiles() -> None:
	today = datetime.date.today().isoformat()
	for name in os.listdir(BASE_PROFILE_DIR):
		path = os.path.join(BASE_PROFILE_DIR, name)
		
		if os.path.isdir(path) and name != today:
			shutil.rmtree(path, ignore_errors=True)

def create_json_file_if_not_exists(
    dir_path: str,
    file_name: str = 'black_list.json',
    data: dict = None
) -> dict:
    if data is None:
        data = {'black_list': []}

    os.makedirs(dir_path, exist_ok=True)

    json_path = os.path.join(dir_path, file_name)

    if os.path.exists(json_path):
        print(f'[CreateJsonFileIfNotExists] [WARN] 파일 이미 존재함: {json_path}')
        return

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'[CreateJsonFileIfNotExists] [SUCCESS] JSON 파일 생성됨: {json_path}')


def load_blacklist(path: str):
	if not os.path.exists(path):
		print(f'[WARN] 파일이 존재하지 않습니다: {path}')
		return set()

	try:
		with open(path, 'r', encoding='utf-8') as file:
			data = json.load(file)
			return set(tag.lower() for tag in data.get('blacklist', []))
	except json.JSONDecodeError:
		print(f'[ERROR] JSON 파싱 실패: {path}')
		return set()


def filter_hashtags(hashtags: list, blacklist_set: set) -> list:
	try:
		return [tag for tag in hashtags if tag.lower() not in blacklist_set]
	except Exception as e:
		traceback.print_exc()
		return hashtags


def is_chromedriver_running() -> bool:
    for proc in psutil.process_iter(attrs=['name']):
        name = proc.info['name']

        if name and 'chromedriver' in name.lower():
            return True
    return False


def instagram_login(command_queue, response_queue) -> Driver:
	profile_path = get_today_profile_path()
	cleanup_old_profiles()

	is_first_login = not os.path.exists(os.path.join(profile_path, 'login.ok'))

	try:
		driver = Driver(profile_path)
		driver.start(LOGIN_URL if is_first_login else BASE_URL)
	except:
		response_queue.put({
			'status': 500, 
			'channel': 'driverStart',
			'data': '처리중 문제가 발생했습니다.\n 만약 실행중인 크롬 드라이버가 있다면 모두 닫고 다시 시도해주세요.',
		})
		return None

	while True:
		if is_chromedriver_running():
			print('is_chromedriver_start.')
			
			response_queue.put({
				'status': 200, 
				'channel': 'driverStart',
			})
			break

	while True:
		msg = command_queue.get()

		if msg['channel'] == 'loggedIn':
			break

	if is_first_login:
		with open(os.path.join(profile_path, 'login.ok'), 'w') as f:
			f.write('logged_in')

	print('loggedIn.')
			
	response_queue.put({
		'status': 200, 
		'channel': 'loggedIn',
	})

	return driver


def search_hashtag(driver: webdriver.Chrome, hash_tag: str) -> None:
	"""
	해쉬태그 검색 함수

	Args:
		hashtag (str): 검색할 해쉬태그
	"""

	time.sleep(5)

	# sidebar에서 검색 버튼 클릭
	driver.find_element(By.CSS_SELECTOR, SEARHC_BUTTON).click()

	time.sleep(5)

	# 검색 창에 처음 입력받은 해쉬태그를 검색
	driver.find_element(By.CSS_SELECTOR, SEARCH_INPUT).send_keys(hash_tag)

	time.sleep(5)

	# 검색결과에서 가장 첫번째 내용을 클릭
	driver.find_element(By.CSS_SELECTOR, FIRST_SEARCH_RESULT).click()


def get_total_post_count(driver: webdriver.Chrome):
	''' 개시글 수 가져오는 함수 '''

	time.sleep(5)

	_count = None

	try:
		# 총 개시물 수 가져오기
		_count = driver.find_element(By.CSS_SELECTOR, TOTAL_POST_COUNT).text

	except Exception:
		time.sleep(5)
		_count = driver.find_element(By.CSS_SELECTOR, TOTAL_POST_COUNT).text

	return int(_count.replace(',', ''))


def scroll_to_get_all_comments(driver: webdriver.Chrome) -> None:
	''' 스크롤해서 모든 댓글 가져오는 함수 '''

	try:
		_is_scroll = True

		element = driver.find_element(By.CSS_SELECTOR, 'div.x5yr21d.xw2csxc.x1odjw0f.x1n2onr6')
		while _is_scroll:
			# 아래로 스크롤 전 스크롤 위치
			_last_height = get_scroll_position(driver, element)
			
			# 스크롤 아래로 내리기
			scroll_down(driver, element)

			# 아래로 스크롤후 스크롤 위치
			_new_height = get_scroll_position(driver, element)
			
			time.sleep(1)

			# 스크롤을 했는데 버퍼링 때문엔 게시글이 안가져와질때
			if _last_height == _new_height:
				_is_scroll = False
	except Exception as e:
		print(e)
		

def click_all_show_replies_btns(driver: webdriver.Chrome) -> None:
	''' 답글 더보기 버튼 모두 클릭하는 함수 '''

	show_replies_btn_list = driver.find_elements(By.CSS_SELECTOR, SHOW_REPLIES_BTN)

	if len(show_replies_btn_list) > 0:
		for btn in show_replies_btn_list:
			btn.click()
			time.sleep(1)


def scroll_up(driver: webdriver.Chrome):
	''' 현재 브라우저 창의 높이만큼 스크롤 올리는 함수 '''

	time.sleep(3)

	driver.execute_script(SCROLL_UP)


def base_scroll_handler(
	driver: webdriver.Chrome,
	command: str, 
	element: Optional[WebElement] = None
):
	time.sleep(3)

	if isinstance(element, WebElement):
		return driver.execute_script(command, element)
	else:
		return driver.execute_script(command)


def scroll_down(
	driver: webdriver.Chrome, 
	element: Optional[WebElement] = None
):
	''' 스크롤 맨아래로 내리는 함수 '''

	base_scroll_handler(driver, SCROLL_DOWN, element)


def get_scroll_position(
		driver: webdriver.Chrome, 
		element: Optional[WebElement] = None
	) -> None:
	''' 스크롤 위치 가져오는 함수 '''

	base_scroll_handler(driver, SCROLL_POSITION, element)


def is_instagram_blocked(
		html: webdriver.Chrome.page_source,
		soup: BeautifulSoup,
	) -> bool:

    # --- title 기반 판단
    title = soup.title.string.strip() if soup.title else 'NO_TITLE'
    if title in ['www.instagram.com', 'Log in • Instagram', 'Page Not Found', '페이지를 사용할 수 없습니다']:
        print(f'[차단 감지] title: {title}')
        return True

    # --- 로그인 리디렉션 or 강제 로그인 유도
    if '/accounts/login/' in html:
        print('[차단 감지] 로그인 리디렉션 감지됨')
        return True

    # --- body 내용이 거의 없음
    if not soup.body or not soup.body.get_text(strip=True):
        print('[차단 감지] body 태그가 비어 있음')
        return True

    return False


def clean_instagram_url(href: str) -> str:
	"""
    Instagram 게시글 URL의 중복 접두어를 제거하고, 상대 경로를 절대경로로 변환하는 함수
	예: https://www.instagram.comhttps://www.instagram.com/p/abc123/ -> \
		www.instagram.com/p/abc123/

    Args:
        href (str): <a> 태그에서 추출한 href 속성 문자열

    Returns:
        str: 정제된 URL 문자열
    """

	if not href:
		return ''

	# 예외 케이스: 중복된 접두어가 붙은 경우
	if href.startswith('https://www.instagram.comhttps://'):
		href = href.replace('https://www.instagram.com', '', 1)

	# 상대 경로인 경우만 절대경로로 변환
	if href.startswith('/p/'):
		href = 'https://www.instagram.com' + href

	return href


def duplicate_count(data_list: list, data_dict: dict) -> None:
	''' list 중복 카운트하여 결과 dict에 추가하는 함수 '''

	for i in data_list:
		try: data_dict[i] += 1
		except: data_dict[i] = 1