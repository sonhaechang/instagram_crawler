import { JSX, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../elements';
import { AlertContext } from '../../providers/AlertProvider';


export default function Login(): JSX.Element {
    const navigate = useNavigate();
    const { ipcRenderer } = window.require('electron');
     const { setIsOpen, setType, setMessage,} = useContext(AlertContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const onClickHandler = () => {
        setIsLoading(true);
		ipcRenderer.send(
            'loggedIn', 
            JSON.stringify({channel: 'loggedIn', data: 'logged_in'})
        );

        ipcRenderer.once('loggedIn', (e: any, args: any) => {
            if (args.status === 200) {
                navigate('/select-option');
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
                Instagram Login
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
                <p>크롬 드라이버가 실행되어 인스타그램 로그인 페이지가 뜨면 해당 크롬 드라이버에서 로그인을 진행해주세요.</p>
                <p>만약 인증이 필요한 상황이면 인증 또한 크롬 드라이버에서 진행해주세요.</p>  
                <p>
                    로그인과 인증이 완료 되었으면, 인스타그램 메인 페이지에서 알림창을 전부 닫은 후 아래의 
                    <span className='text-indigo-600 px-1'>"계속하기"</span> 
                    버튼을 눌러주세요.
                </p>  

                <p 
                    className='
                        mt-5 
                        text-xs
                        text-gray-600
                    '
                >
                    * 로그인후 프로그램을 다시 실행해도 당일은 로그인이 유지됩니다.
                </p>                 
            </div>

            <div 
                className='
                    mt-10 
                    w-32
                '
            >
                <Button
                    title='계속하기'
                    btnClass='
                        bg-indigo-600 
                        text-white 
                        hover:bg-indigo-500
                        focus-visible:outline-indigo-600 
                    '
                    disabled={isLoading}
                    onClick={onClickHandler}
                />
            </div>
        </>
    )
}