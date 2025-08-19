import platform
import os


if platform.system() == 'Darwin':
    parts = ['Library', 'Application Support', 'instagram_crawler']
elif platform.system() == 'Windows':
    parts = ['AppData', 'Roaming', 'instagram_crawler']
else:
    parts = ['.config', 'instagram_crawler']

BASE_DIR = os.path.join(os.path.expanduser('~'), *parts)
BASE_DRIVER_DIR = os.path.join(BASE_DIR, 'driver')
BINARY_FILE_PATH = 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' \
    if platform.system() == 'Darwin' else 'chrome/chrome.exe'
BINARY_DIR = os.path.join(BASE_DRIVER_DIR, BINARY_FILE_PATH)
DRIVER_DIR = os.path.join(
    BASE_DRIVER_DIR, 
    'chromedriver' if platform.system() == 'Darwin' else 'chromedriver.exe'
)
CRAWLING_RESULT_DIR = os.path.join(BASE_DIR, 'crawling_results')
BASE_PROFILE_DIR = os.path.join(BASE_DIR, '.chrome_profiles')
BLACK_LIST_DIR = os.path.join(BASE_DIR, 'black_list')
BLACK_LIST_PATH = os.path.join(BLACK_LIST_DIR, 'black_list.json')

BASE_URL = 'https://www.instagram.com'
LOGIN_URL = f'{BASE_URL}/accounts/login/'

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'

ECTRACT_NUM = 300

# 로그인 버튼 
LOGIN_BTN = '//*[@id="loginForm"]/div/div[3]'

# 로그인 정보 저장 알림팝업창 나중에 하기 버튼
LOGIN_INFO_POPUP = 'div.x78zum5.xdt5ytf.x1e56ztr > div'

# 이메일 인증번호 입력창 
EMAIL_INOUT = 'div.x6s0dn4.x78zum5.x1qughib.xh8yej3 > input'

# 본인 확인 방식 더보기 버튼
# 'a'

# 본인 확인 방식 선택 Input 태그
# 'input.x1i10hfl.x9f619.xggy1nq.xtpw4lu.x1tutvks.x1s3xk63.x1s07b3s.x1ypdohk.x5yr21d.x1o0tod.xdj266r.x14z9mp.xat24cr.x1lziwak.x1w3u9th.x1a2a7pz.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x10l6tqk.x13vifvy.xh8yej3'

# 검색창 버튼
SEARHC_BUTTON = 'div.x1iyjqo2.xh8yej3 > div:nth-of-type(2) a > div'

# 검색 창
# SEARCH_INPUT = 'input._aauy'
SEARCH_INPUT = 'div.xjoudau.x6s0dn4.x78zum5.xdt5ytf.x1c4vz4f.xs83m0k.xrf2nzk.x1n2onr6.xh8yej3.x1hq5gj4 > input'

# 검색결과에서 가장 첫번째 내용
FIRST_SEARCH_RESULT = 'div.x9f619.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.xh8yej3.xocp1fn > a:nth-child(1)'

# 총 개시물 수
TOTAL_POST_COUNT = 'span._ac2a'

SHOW_MORE_COMMENT_BTN = 'button._abl-'

# 답글 더보기 div 태그
SHOW_REPLIES_BTN = 'div.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.xwib8y2.x1y1aw1k.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1'

# 개시글들의 a 태그
# POST_A_TAG = 'div.x78zum5.xdt5ytf.x11lt19s.x1n2onr6.xph46j.x7x3xai.xsybdxg.x194l6zq a'
POST_A_TAG = 'div.x78zum5.xdt5ytf.x11lt19s.x1n2onr6.xph46j.x7x3xai.xsybdxg.x194l6zq a[href^="/p/"]'

# 해쉬태그가 들어있는 title 태그
HASH_TAG_TITLE_TAG = 'span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.xyejjpt.x15dsfln.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x10wh9bi.xpm28yp.x8viiok.x1o7cslx a'

# # 스크롤 현재 브라우저 크기만큼 올리는 스크립트
# SCROLL_UP = 'window.scrollTo(0, window.innerHeight || document.body.clientHeight)'
# 스크롤을 일정 높이만큼 올리는 스크립트
SCROLL_UP = 'window.scrollBy(0, -800);'

# 스크롤 맨아래로 내리는 스크립트
SCROLL_DOWN = 'window.scrollTo(0, document.body.scrollHeight);'

# 현재 스크롤 위치 가져오는 스크립트 
# 'return document.body.scrollHeight' not working is return 0
SCROLL_POSITION = 'return document.documentElement.scrollHeight'