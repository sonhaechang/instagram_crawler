import { JSX, ReactNode } from 'react';


interface Props {
    type?: any;
    title: string | ReactNode;
    disabled?: boolean;
    small?: boolean;
    btnClass?: string;
    onClick: () => void;
}

export default function Button({
    type='button',
    title,
    disabled,
    btnClass,
    onClick
}: Props): JSX.Element {
    return (
        <button
            type={type}
            className={`
                w-full
                rounded-md 
                px-3.5 
                py-2.5 
                text-sm 
                font-semibold 
                shadow-sm 
                focus-visible:outline 
                focus-visible:outline-2 
                focus-visible:outline-offset-2 
                ${
                    disabled ? 
                    'cursor-not-allowed opacity-80' : 
                    'hover:opacity-80 cursor-pointer'
                }
                ${
                    btnClass ?
                    btnClass :
                    `
                        bg-white 
                        text-gray-900 
                        ring-1 
                        ring-inset 
                        ring-gray-300 
                        hover:bg-gray-50 
                        focus-visible:outline-gray-300
                    `
                }
            `}
            disabled={disabled}
            onClick={ onClick}
        >
            {title}
        </button>
    );
}