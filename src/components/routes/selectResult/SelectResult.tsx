import { JSX, useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CgSpinner } from 'react-icons/cg';
import SearchHashtag from './SearchHashtag';
import SelectFile from './SelectFile';
import { Button } from '../../elements';
import { AlertContext } from '../../../providers/AlertProvider';


export default function SelectResult(): JSX.Element {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { ipcRenderer } = window.require('electron');
    const selected_option = searchParams.get('selected_option');
    const { setIsOpen, setType, setMessage,} = useContext(AlertContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hashtag, setHashtag] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

    const ipcRendererListener = (e: any, args: any) => {
        console.log(args);
        if (args.status === 200) {
            setIsLoading(false);

            if (args.data) navigate('/extract');
            else navigate('/select-option');
        } else {
            setType('error');
            setMessage(args.data);
            setIsOpen(true);
            setIsLoading(false);
        }
    }

    const onHandleClick = () => {
        if (selected_option === '1') {
            if (hashtag === '') {
                alert('해시태그를 입력해주세요.');
                return;
            }

            setIsLoading(true);

            ipcRenderer.send(
                'hashtag', 
                JSON.stringify({channel: 'hashtag', data: `#${hashtag}`})
            );

            ipcRenderer.once('hashtag', ipcRendererListener);
        } else if (selected_option === '2') {
            if (fileName === '') {
                alert('파일을 선택해주세요.');
                return;
            }

            setIsLoading(true);

            ipcRenderer.send(
                'fileName', 
                JSON.stringify({channel: 'fileName', data: fileName})
            );

            ipcRenderer.once('fileName', ipcRendererListener);
        }
    };

    const onGoBack = () => {
        setIsLoading(true);

        const channelName = selected_option === '1' ? 'hashtag' : 'fileName';

        ipcRenderer.send(
            channelName, 
            JSON.stringify({channel: channelName, data: 'goBack'})
        );

        ipcRenderer.once(channelName, ipcRendererListener);
    } 

    return (
        <>
            <h2 
                className='
                    text-2xl 
                    font-semibold 
                    tracking-tight 
                    text-gray-900
                '
            >
                {
                    selected_option === '1' ? 
                    'Search Hashtag' : 
                    'Select Excel File'
                }
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
                <p>
                    {
                        selected_option === '1' ? 
                        '검색할 해시태그를 입력해주세요.' : 
                        '게시글 url이 저장된 엑셀 파일을 선택해주세요.'
                    }
                </p>
            </div>

            {
                selected_option === '1' ? (
                    <SearchHashtag 
                        hashtag={hashtag}
                        setHashtag={setHashtag}
                    />
                ) : (
                    <SelectFile 
                        selectedOption={fileName}
                        setSelectedOption={setFileName}
                    />
                )}

            <div 
                className='
                    mt-10 
                    w-64
                    flex
                    gap-2
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
                            이전
                        </div>
                    }
                    onClick={onGoBack}
                />
           
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
                    onClick={onHandleClick}
                    disabled={isLoading}
                />
            </div>
        </>
    );
}