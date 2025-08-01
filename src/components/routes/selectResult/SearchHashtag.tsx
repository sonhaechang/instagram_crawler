import { Dispatch, JSX, SetStateAction, useEffect, useRef } from 'react';


interface Props {
    hashtag: string;
    setHashtag: Dispatch<SetStateAction<string>>;
}

export default function SearchHashtag({
    hashtag,
    setHashtag
}: Props): JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);

    const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHashtag(e.target.value)
    };

    useEffect(() => {
        if (inputRef.current) {
        inputRef.current.focus();
        }
    }, []);

    return (
        <div 
            className='
                mt-5 
                flex 
                w-1/2
                group 
            '
        >
            <div 
                className='
                    flex 
                    shrink-0 
                    items-center 
                    rounded-l-md 
                    bg-white 
                    px-3 
                    text-base 
                    text-gray-500 
                    outline 
                    outline-1 
                    -outline-offset-1 
                    outline-gray-300 
                    sm:text-sm/6
                    sibling 
                    group-focus-within:outline 
                    group-focus-within:outline-1 
                    group-focus-within:-outline-offset-1 
                    group-focus-within:outline-indigo-600 
                    group-focus-within:text-indigo-600
                '
            >
                #
            </div>
            <input
                type='text'
                value={hashtag}
                placeholder='"#"을 제외한 해시태그 입력해주세요.'
                className='
                    -ml-px 
                    block 
                    w-full 
                    grow 
                    rounded-r-md 
                    bg-white 
                    px-3 
                    py-1.5 
                    text-base 
                    text-gray-900 
                    outline 
                    outline-1 
                    -outline-offset-1 
                    outline-gray-300 
                    placeholder:text-gray-400 
                    focus:outline 
                    focus:outline-1 
                    focus:-outline-offset-1 
                    focus:outline-indigo-600 
                    sm:text-sm/6
                '
                onChange={onHandleChange}
                ref={inputRef}
            />
        </div>
    )
}