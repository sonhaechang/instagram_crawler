import { JSX, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgSpinner } from 'react-icons/cg';
import { Button } from '../elements';
import { AlertContext } from '../../providers/AlertProvider';


export default function Home(): JSX.Element {
    const navigate = useNavigate();
    const { ipcRenderer } = window.require('electron');
    const { setIsOpen, setType, setMessage,} = useContext(AlertContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
   
    const onOpenDriverDir = () => {
        ipcRenderer.send('openDriverDir');
    }

    const onChromedriverDownload = () => {
		window.require('electron').shell.openExternal(
			'https://developer.chrome.com/docs/chromedriver/downloads?hl=ko'
		);
	}

	const onStartCrawling = () => {
        setIsLoading(true);
		ipcRenderer.send('driverStart', JSON.stringify({channel: 'driverStart', data: true}));
        ipcRenderer.once('driverStart', (e: any, args: any) => {
            if (args.status === 200) {
                navigate('/login');
            } else {
                setType('error');
                setMessage(args.data)
                setIsOpen(true);
                setIsLoading(false);
            }
        });
	}

    return (
        <>
            <h2 
                className='
                    text-xl 
                    font-semibold 
                    tracking-tight 
                    text-gray-900
                '
            >
                Chromedriver Start
            </h2>

            <div 
                className='
                    mt-5 
                    text-sm 
                    font-medium 
                    text-pretty 
                    text-gray-500
                    space-y-2
                '
            >
                <p>크롤링을 시작 할려면 chromedriver가 필요합니다.</p>
                <p>
                    본인이 사용하는 Chrome 버전을 확인 후 chrome과 chromedriver를 
                    <span 
                        className='
                            pl-1
                            text-indigo-600
                            cursor-pointer
                        '
                        onClick={onOpenDriverDir}
                    >
                        driver 폴더
                    </span>
                    에 설치해 주세요.
                </p>
                <p>chrome은 다운받아 압축 해제 후 폴더 이름을 chrome으로해서 통째로 옮겨주세요.</p>

                <br />

                <p>해당 프로그램은 Chrome 버전 115 이상만을 지원합니다. </p>
                <p>Chrome 버전 115 이하는 Chrome 버전을 업데이트 후 사용해주세요.</p>
            </div>

            <p 
                className='
                    mt-5 
                    font-medium
                    text-indigo-600 
                    text-sm 
                    cursor-pointer
                    inline-block
                '
                onClick={onChromedriverDownload}
            >
                크롬 드라이버 다운로드
            </p>

            <div 
                className='
                    mt-10
                    w-48
                '
            >
                <Button
                    title={
                        <div 
                            className='
                                flex
                                items-center
                                justify-center
                            '
                        >
                            {isLoading && (
                                <CgSpinner 
                                    className='
                                        animate-spin
                                        h-5 
                                        w-5 
                                        mr-3 
                                    ' 
                                />
                            )}
                            크롬 드라이버 시작
                        </div>
                    }
                    btnClass='
                        bg-indigo-600 
                        text-white 
                        hover:bg-indigo-500
                        focus-visible:outline-indigo-600 
                    '
                    disabled={isLoading}
                    onClick={onStartCrawling}
                />
            </div>
        </>
    )
}