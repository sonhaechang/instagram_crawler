from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

from instagram_crawling.meta_data import (
	DRIVER_DIR, BINARY_DIR, USER_AGENT,
)


class Driver:
    def __init__(self, profile_path: str) -> None:
        self.instance: webdriver.Chrome = self.create(profile_path)

    def create(self, profile_path: str) -> webdriver.Chrome:
        options = Options()
        options.binary_location = BINARY_DIR
        service = Service(DRIVER_DIR)
        options.add_argument(f'user-agent={USER_AGENT}')
        options.add_argument('--disable-gpu')                   # GPU 비활성화 (Windows에서 안정성 향상)
        options.add_argument('--no-sandbox')                    # Linux 환경에서 필요할 수 있음
        options.add_argument('--disable-dev-shm-usage')         # 메모리 공유 비활성화
        options.add_argument(f'--user-data-dir={profile_path}') # 로그인 정보 저장
        # options.add_argument('--headless=new')                  # 최신 방식 (Chrome 109 이상 권장)
        # options.add_argument('--window-size=1920,1080')         # 가상 창 크기 지정 (필요시)
        options.add_experimental_option('detach', True)         # 창을 닫지 않게 설정

        return webdriver.Chrome(service=service, options=options)

    def start(self, url: str) -> None:
        self.instance.implicitly_wait(3)
        self.instance.get(url)