import { JSX } from 'react';
import { IoLogoInstagram } from 'react-icons/io5';

export default function Header(): JSX.Element {
    return (
        <div 
            className='
                pt-[74px]
                pb-10
                bg-gradient-to-r 
                from-indigo-500 
                via-purple-500 
                to-pink-500
            '
        >
            <div 
                className='
                    mx-auto 
                    max-w-2xl
                '
            >
                <h2 
                    className='
                        text-2xl 
                        font-semibold 
                        tracking-tight 
                        text-white
                        flex
                        items-center
                        gap-1
                    '
                >
                    <IoLogoInstagram />
                    <p>Instagram crawler</p>
                </h2>
            </div>
        </div>
    );
}