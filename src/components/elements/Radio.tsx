import { JSX } from 'react';


interface Porp {
    title: string;
    value: string;
    selectedOption: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    size?: string;
}

export default function Radio({ 
    title, 
    value, 
    selectedOption, 
    onChange, 
    size='base',
}: Porp): JSX.Element {
    const sizeDict: {[key: string]: string} = {
        small: 'size-3',
        base: 'size-4',
        large: 'size-6'
    };

    const textSizeDict: {[key: string]: string} = {
        small: 'text-xs/6 ',
        base: 'text-sm/6 ',
        large: 'text-base/6 '
    };

    return (
        <label 
            className={`
                ${textSizeDict[size]}
                font-medium 
                text-gray-800
                flex 
                items-center 
                gap-x-3
                cursor-pointer
            `}
        >
            <input
                type='radio'
                name='slelect_option'
                value={value}
                checked={selectedOption === value}
                onChange={onChange}
                className={`
                    ${sizeDict[size]}
                    relative 
                    appearance-none 
                    rounded-full 
                    border 
                    border-gray-300 
                    bg-white 
                    before:absolute 
                    before:inset-1 
                    before:rounded-full 
                    before:bg-white 
                    checked:border-indigo-600 
                    checked:bg-indigo-600 
                    focus-visible:outline 
                    focus-visible:outline-2 
                    focus-visible:outline-offset-2 
                    focus-visible:outline-indigo-600 
                    disabled:border-gray-300 
                    disabled:bg-gray-100 
                    disabled:before:bg-gray-400 
                    forced-colors:appearance-auto 
                    forced-colors:before:hidden 
                    [&:not(:checked)]:before:hidden
                `}
            />
            {title}
        </label>
    );
}