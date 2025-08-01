import { JSX, useContext, useEffect, useRef, useState } from 'react';

import { CgSpinner } from 'react-icons/cg';
import { Button } from '../elements';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../providers/AlertProvider';


interface porgressStatusProps {
    isFinish: boolean;
    isStop: boolean;
}

function PorgressStatus({
    isFinish,
    isStop,
}: porgressStatusProps): JSX.Element {
    const element = () => {
        if (!isFinish && !isStop){
            return (
                <>
                    <CgSpinner 
                        className='
                            text-indigo-600
                            animate-spin
                            h-5 
                            w-5 
                            mr-3 
                        ' 
                    />
                    <span>크롤링 진행중 ... </span>
                </>
            ) 
        } else if (isStop) {
            return  <span>크롤링이 중지되었습니다.</span>
        } else if (isFinish) {
            return <span>크롤링이 완료되었습니다.</span>
        };
    };

    return (
        <p 
            className='
                flex
                items-center
            '
        >
            {element()}
        </p>
    )
}

export default function Extract(): JSX.Element {
    const navigate = useNavigate();
    const { ipcRenderer } = window.require('electron');
    const { setIsOpen, setType, setMessage, setIsConfirm, setAction } = useContext(AlertContext);
    const scrollRef = useRef<HTMLUListElement | null>(null);
    const [isFinish, setIsFinish] = useState<boolean>(false);
    const [isStop, setIsStop] = useState<boolean>(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onConfirm = () => {
        setIsOpen(false);
        setIsLoading(true);
        
        ipcRenderer.send(
            'extractStop', 
            JSON.stringify({channel: 'extractStop'})
        );

        ipcRenderer.once('extractStop', (e: any, args: any) => {
            setIsConfirm(false);

            if (args.status === 200) {
                setMessage(args.data.data);
                setType('success');      
                setIsOpen(true);
                setIsStop(true);
            } else {
                setType('error');
                setMessage(args.data.data);
                setIsOpen(true);
            }

            setIsLoading(false);
        });
    };
    
    const onStopHandler = () => {
        setMessage('정말 크롤링을 중단 하시겠습니까?');
        setType('question');
        setIsConfirm(true);
        setAction(() => onConfirm);
        setIsOpen(true);
    };

    const onOpenResultsDir = () => {
        ipcRenderer.send('openResultsDir');
    };

    useEffect(() => {
        ipcRenderer.on('extract', (e: any, args: any) => {
            if (args.status === 200) {
                if (args.data.type === 'msg') {
                    setMessages(prev => [...prev, args.data.data]);
                } else if (args.data.type === 'is_extract_finish') {
                    setIsFinish(true);
                }
            } else {
                setType(args.status === 500 ? 'error' : 'warning');
                setMessage(args.data.data);
                setIsOpen(true);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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
                Instagram crawling
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
                <PorgressStatus 
                    isFinish={isFinish}
                    isStop={isStop}
                />
            </div>

            <ul 
                ref={scrollRef}
                className='
                    mt-5
                    w-full
                    h-52
                    rounded-md 
                    border-[1px]
                    border-gray-300
                    pl-5
                    p-3
                    space-y-3
                    list-disc
                    text-sm
                    overflow-scroll
                    bg-white
                '
            >
                {messages.map((message: string, idx: number) => (
                    <li key={idx}>{message}</li>
                ))}
            </ul>

            <div 
                className={`
                    mt-10 
                    flex
                    gap-2
                    ${
                        isFinish || isStop ? 
                        'w-96' : 
                        'w-40' 
                    }
                `}
            >
                
                {isFinish || isStop ? (
                    <>
                        <Button 
                            title='크롤링 옵션 선택 페이지로'
                            onClick={() => navigate('/select-option')}
                        />

                        <Button 
                            title='결과 폴더 열기'
                            btnClass='
                                bg-indigo-600 
                                text-white 
                                hover:bg-indigo-500
                                focus-visible:outline-indigo-600 
                            '
                            onClick={onOpenResultsDir}
                        />
                    </>
                ) : (
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
                                            h-5 w-5 
                                            mr-3 
                                        ' 
                                    />
                                )}
                                크롤링 중단
                            </div>
                        }
                        btnClass='
                            bg-indigo-600 
                            text-white 
                            hover:bg-indigo-500
                            focus-visible:outline-indigo-600 
                        '
                        onClick={onStopHandler}
                        disabled={isLoading}
                    />
                )}
            </div>
        </>
    );
}