## Description
**Instagram Crawler**는 Instagram을 크롤링하여 해쉬태그 추출합니다.

인스타그램에서 일정 수 이상의 게시물에 접근하면 게시물이 더 이상 로드되지 않습니다. (약 100~300개의 게시물을 크롤링 가능)

따라서 검색된 모든 게시글에서 해쉬태그를 추출 가능하도록 2번의 과정을 걸쳐 크롤링을 진행하게 됩니다.

1. Selenium으로 해쉬태그를 검색하고 맨 아래까지 스크롤하여 모든 게시글의 url을 추출해 엑셀로 저장합니다.  
ex) [검색한 해쉬태그]_[날짜].xlsx의 post_url이라는 sheet에 저장됨

2. 엑셀에 저장된 url을 하나씩 가져와 Selenium로 게시물에 접근하여 해쉬태그를 추출해서 엑셀에 저장합니다.  
이때 게시글 url에 접근할때마다 횟수를 카운트해두기 때문에 게시물이 더 이상 로드되지 않아 크롤링을 못하게 되더라도 이어서 해쉬태그를 추출이 가능합니다.  
ex) [검색한 해쉬태그]_[날짜].xlsx의 tag_name이라는 sheet에 저장됨

한번에 해쉬태그를 크롤링 하는것이 아닌 2번에 걸쳐 크롤링을 하기에 시간이 좀 걸립니다.

✅ 2번 과정으로 일정 수 이상 게시물 접근시 429 오류 처리되어서 한동안 해쉬태그 추출이 안됩니다. 429 오류를 방지하기 위해서 한번에 최대 100개 ~ 300개의 개시글만 접근해서 해쉬태그 추출이 됩니다.

✅ 시간이 좀 걸리고 번거로워도 사용할때 2번 과정을 시간을 두고 여러번 2번 방식을 돌리는 것을 권장합니다. 

⚠️ 만약 추출중 오류가 발생하면 시간을 두고 기다렸다가 다시 시도헤보세요.

✅ 인스타그램에서 주기적으로 html 구조나 css 변경 및 크롤링을 막기위한 패치 및 업데이트를 하는 것 같습니다. 그래서 사용중 문제가 생겨서 안되는 경우가 종종 발생 할 것으로 예상됩니다.

🙏 문제를 발경하면 최대한 다시 사용 가능하게 코드 수정을 하겠지만 자주 확인은 못하기 때문에 사용중 문제가 발생하면 알려주세요.

🎉 좀 더 편리한 사용을 위해서 해당 GLI 프로그램으로 만들어 배포합니다. 파이썬과 라이브러리 설치 필요 없이 설치 파일을 받아서 설치 후 사용하시면 됩니다.

## Get Start

1. 설치 파일을 다운받은 후 설치해서 Instagram Crawler을 실행합니다.
   - Windows와 Mac OS 설치 파일은 다운받아 사용하시면됩니다.
   - Linux의 경우 지원하지 않습니다. (추후 지원 예정)

   [설치 파일 다운로드](/)

2. 프로그램을 실행하면 Downloads/instagram_crawler 경로에 파일들이 생성됩니다.
    - driver: 크롬드라이버
    - crawling_results: 크롤링 결과
    - black_list: 블랙리스트

3. 본인이 사용하는 크롬 버전을 확인 후 동일한 버전의 chromer과 chromedriver를 설치해서 driver 폴더에 추가 후 CMD창에서 Enter를 입력해주세요.
    - 해당 프로그램은 Chrome 버전 115 이상만을 지원합니다. 115 이하는 크롬 버전을 업데이트 후 사용해주세요.

    [크롬 드라이버 다운로드](https://chromedriver.chromium.org/downloads)
    
4. 크롬 드라이버가 실행되어 인스타그램 로그인 페이지가 뜨면 해당 크롬 드라이버 인스타그램 로그인 페이지에서 로그인을 진행해주세요.  
만약 인증이 필요한 상황이면 인증완료 및 알림창을 전부 닫은 후 (크롬 드라이버에 인스타그램 메인 페이지가 띄워진 상태) CMD창에서 Enter를 입력해주세요.
    - 첫 로그인후 프로그램을 다시 실행해도 당일까진 로그인이 유지됩니다.  
        ex) 1일날 로그인후 다시 실행시에는 로그인 필요 없고 종료 후 2일날 다시 시작하면 로그인이 필요  

5. 크롤링 옵션 선택 후 크롤링 진행
    1. 해시태그 검색, 게시글 url 및 해시태그 추출  
        - 검색할 해시태그를 CMD창에 입력하면 검색된 게시글 url 및 해시태그 추출을 시작합니다.
        
    2. 저장된 게시글 url로 해시태그만 추출  
        - CMD창에서 이어서 추출할 엑셀 파일을 선택하면 추출을 시작합니다.

<br/>
<br/>

**⚠️ 앱 실행시 내부적으로 65432번 포트를 사용합니다. 만약 65432 포트를 사용하는 다른 프로세스가 실행중이라면 앱 실행시 오류가 발생 가능성이 있습니다.**

## Install

설치 파일을 받아서 사용하는게 아닌 개발 환경을 설정해서 사용해보시고 싶으시면 아래 순서대로 진행해주세요. (python과 node가 필요합니다.) 

1. `git clone https://github.com/sonhaechang/instagram_crawler.git`

2. `cd instagram_crawler`

3. `conda create -p ./backend/venv python=3.9`   
instagram_crawler project안에 backend 폴더에 가상환경 생성  

    - 만약 python 다른 버전을 사용하고 싶다면 사용할 버전으로 설치 (3.9로 사용하는걸 권장)  
    - instagram_crawler/public/electron.ts의 getCurrentOsPythonPath에 python3.x를 설치한 python 버전에 맞춰서 수정 (윈도우의 경우 불필요)

4. `conda activate ./backend/venv`

5. `pip install -r requirements.txt`

6. `npm install`

## Starting Development

개발 환경에서 앱을 시작하려면: `npm start`

## Packaging for Production

로컬 플랫폼에 앱을 패키징하려면: `npm run build`

- 결과 패키징 결과는 instagram_crawler/dist/ 에 저장됩니다.

## Stack

- python: 3.9.12
- selenium: 4.7.2 
- beautifulsoup4: 4.11.1
- react: 19.1.0
- typescript: 4.9.5
- electron: 37.2.4
- tailwindcss: 3.4.17