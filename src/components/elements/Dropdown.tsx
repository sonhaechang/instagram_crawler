import { JSX, useEffect, useRef, useState } from 'react';

interface menuProps {
    title: string | React.ReactElement;
    onClick: () => void;
}

interface Props {
    title: string;
    menus: menuProps[];
    disabled?: boolean;
    small?: boolean;
    btnClass?: string;
    menuClass?: string;
    menuPosition?: string | null;
    btnOutline?: boolean;
    btnPadding?: string | null;
    btnBgColor?: string;
    menuBgColor?: string | null;
    menuWidth?: string;
    isScroll?: boolean;
}

export default function Dropdown({
    title,
    menus,
    disabled,
    small,
    btnClass,
    menuClass,
    menuPosition=null,
    btnOutline=false,
    btnPadding=null,
    btnBgColor='bg-transparent',
    menuBgColor=null,
    menuWidth='w-56',
    isScroll=false,
}: Props): JSX.Element {
    const dropDownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownActive, setDropdownActive] = useState<boolean>(false);

    const onClick = () => {
        setDropdownActive((prev) => !prev);
    }

    useEffect(() => {
        const handleOutsideClose = (e: {target: any}) => {
            // @ts-ignore // useRef current에 담긴 엘리먼트 바깥을 클릭 시 드롭메뉴 닫힘
            if (dropdownActive && (!dropDownRef.current.contains(e.target))) {
                setDropdownActive(false);
            }
        };

        document.addEventListener('click', handleOutsideClose);
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [dropdownActive]);

    return (
        <div 
            ref={dropDownRef}
            className='
                relative 
                inline-block 
                text-left
            '
        >
            <div>
                <button 
                    className={`
                        transition
                        text-center
                        rounded-md
                        font-base
                        font-semibold
                        ${
                            disabled ? 
                            `
                                cursor-not-allowed 
                                opacity-80
                            ` : 
                            `
                                hover:opacity-80 
                                cursor-pointer
                            `
                        }
                        ${
                            small ? 
                            btnPadding ? `text-xs ${btnPadding}` : 'text-xs py-1.5 px-5' : 
                            btnPadding ? `text-sm ${btnPadding}` : 'text-sm py-2 px-5'
                        }
                        ${
                            btnClass ?
                            btnClass : (
                                `   text-black 
                                    dark:text-white 
                                    ${btnBgColor}
                                    ${
                                        btnOutline ? 
                                        '' : 
                                        `
                                            border-[1px]
                                            border-gray-300 
                                            dark:border-neutral-600
                                        `
                                    }
                                `
                            )
                        }
                    `}
                    onClick={onClick}
                >
                    {title}
                </button>
            </div>

            <div 
                className={`
                    absolute 
                    z-10 
                    my-2 
                    origin-top-right 
                    divide-y  
                    rounded-md 
                    ring-1 
                    ring-black 
                    ring-opacity-5 
                    focus:outline-none
                    
                    overflow-scroll
                    ${
                        isScroll ? 
                        `
                            overflow-scroll 
                            h-[180px]
                        ` : 
                        `
                            overflow-hidden 
                            h-auto
                        `
                    }
                    ${menuWidth}
                    ${
                        dropdownActive ? 
                        'block' : 
                        'hidden'
                    }
                    ${
                        menuPosition ?
                        menuPosition :
                        ''
                    }
                    ${
                        menuClass ?
                        menuClass :
                        `
                            ${
                                menuBgColor ? 
                                menuBgColor : 
                                `
                                    bg-white 
                                    dark:bg-neutral-900 
                                `
                            }
                            text-black 
                            dark:text-white 
                            border-[0.5px] 
                            border-gray-300 
                            dark:border-neutral-600 
                            divide-gray-300 
                            dark:divide-neutral-600
                        `
                    }
                `}
            >
                {menus.map((menu, idx) => (
                    <div 
                        key={idx}
                        className='
                            py-1 
                            cursor-pointer 
                            hover:opacity-80
                        '
                        onClick={() => {
                            menu.onClick();
                            setDropdownActive((prev) => !prev);
                        }}
                    >
                        <div 
                            className='
                                block 
                                px-4 
                                py-2 
                                text-sm
                                text-gray-600
                            '
                        >
                            {menu.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}