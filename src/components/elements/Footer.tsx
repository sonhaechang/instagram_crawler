import { JSX } from 'react';

export default function Footer(): JSX.Element {
    return (
        <footer
            className='
                navbar
                absolute
                bottom-0
                w-full 
                bg-gray-50
                dark:bg-neutral-800
                border-t
                border-gray-100
                z-10 
                flex
            '
        >
            <div 
                className='
                    flex 
                    justify-center 
                    items-center 
                    text-gray-800 
                    text-xs 
                    w-full 
                    h-[34px]
                '
            >
                Copyright &copy; 2025. All rights reserved.
            </div>
        </footer>
    )
}