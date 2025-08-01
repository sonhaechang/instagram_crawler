import { JSX, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';


interface Props {
    isOpen: boolean;
    onModalClose: () => void;
    isHeader?: boolean;
    children: React.ReactElement;
}

export default function Modal({
    isOpen,
    onModalClose,
    children,
    isHeader=true,
}: Props): JSX.Element {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    return (
        <div 
            className={`
                relative 
                ${isOpen ? 'z-[100]' : 'z-[-1]'}
            `}
        >
            <div 
                className={`
                    fixed 
                    inset-0 
                    bg-gray-900/75 
                    transition-opacity
                    ease-out 
                    duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                `}
            />
        
            <div 
                className='
                    fixed 
                    inset-0 
                    z-10 
                    w-screen 
                    overflow-y-auto
                '
            >
                <div 
                    className='
                        flex 
                        min-h-full 
                        items-center 
                        justify-center 
                        p-4 
                        text-center  
                        sm:p-0
                    '
                >
                    <div 
                        className={`
                            relative 
                            transform 
                            overflow-hidden 
                            rounded-lg 
                            bg-white 
                            text-left 
                            shadow-xl 
                            transition-all 
                            sm:w-full 
                            sm:max-w-xl 
                            ease-out 
                            duration-300
                            ${isOpen ? 'opacity-100' : 'opacity-0'}
                        `}
                    >
                        {isHeader ? (
                            <div 
                                className='
                                    px-4
                                    pt-5
                                    flex
                                    justify-end
                                '
                            >
                                <button
                                    type='button'
                                    className='
                                        text-gray-700
                                        hover:text-gray-900
                                    '
                                    onClick={onModalClose}
                                >
                                    <HiXMark 
                                        className='size-6'
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className='pt-10' />
                        )}
                        
                        <div 
                            className='
                                px-4 
                                pb-4 
                                sm:p-6
                                //sm:my-8 
                            '
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}