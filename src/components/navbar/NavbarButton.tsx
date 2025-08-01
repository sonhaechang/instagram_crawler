import { JSX } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { HiMinus } from 'react-icons/hi2';

interface Props {
    onMinimizeWindow: () => void;
    onCloseWindow: () => void;
}

export default function NavbarButton({
    onMinimizeWindow,
    onCloseWindow
}: Props): JSX.Element {
    return (
        <div 
            className='
                navbar-item
                flex 
                flex-row 
                justify-center
                items-center
                gap-1
                absolute
                right-0
            '
        >
            <button
                className='
                    px-4 
                    py-2 
                    hover:dark:bg-neutral-600
                    hover:bg-gray-300
                '
                onClick={onMinimizeWindow}
            >
                <HiMinus />
            </button>

            <button 
                className='
                    px-4 
                    py-2 
                    hover:bg-red-500
                    hover:border-red-500
                '
                onClick={onCloseWindow}
            >
                <HiXMark />
            </button>
        </div>
    );
}