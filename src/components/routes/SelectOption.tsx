import { JSX, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgSpinner } from 'react-icons/cg';
import { Button, Radio } from '../elements';
import { AlertContext } from '../../providers/AlertProvider';


export default function SelectOption(): JSX.Element {
    const navigate = useNavigate();
    const { ipcRenderer } = window.require('electron');
    const { setIsOpen, setType, setMessage,} = useContext(AlertContext);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(e.target.value);
    };

    const onHandleClick = () => {
        if (selectedOption === '') {
            alert('크롤링 옵션을 선택해주세요.');
            return;
        }

        setIsLoading(true);

        ipcRenderer.send(
            'crawlingOption', 
            JSON.stringify({channel: 'crawlingOption', data: parseInt(selectedOption)})
        );

        ipcRenderer.once('crawlingOption', (e: any, args: any) => {
            if (args.status === 200) {
                navigate(`/select-result?selected_option=${selectedOption}`);
            } else {
                setType('warning');
                setMessage(args.data)
                setIsOpen(true);
                setIsLoading(false);
            }
        });
    }

    const radioElements =  [
        {
            id: 'option1', 
            title: '1. 해시태그 검색, 게시글 url 및 해시태그 추출', 
            value: '1', 
        },
        {
            id: 'option2', 
            title: '2. 저장된 게시글 url로 해시태그만 추출', 
            value: '2', 
        },
    ];

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
                Select crawling option
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
                <p>크롤링 옵션을 선택해주세요.</p>
            </div>

            <div 
                className='
                    mt-10 
                    space-y-5
                '
            >
                {radioElements.map((ele: any, idx: number) =>(
                    <Radio 
                        key={idx}
                        title={ele.title}
                        value={ele.value}
                        selectedOption={selectedOption}
                        onChange={onHandleChange}
                    />
                ))}
            </div>

            <div 
                className='
                    mt-10 
                    w-32
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
                            다음
                        </div>
                    }
                    btnClass='
                        bg-indigo-600 
                        text-white 
                        hover:bg-indigo-500
                        focus-visible:outline-indigo-600 
                    '
                    disabled={isLoading}
                    onClick={onHandleClick}
                />
            </div>
        </>
    );
}