import { JSX, useEffect, useState } from 'react';
import { IoLogoInstagram } from 'react-icons/io5';
import NavbarButton from './NavbarButton';
import NavbarMenu from './NavbarMenu';

export default function Navbar(): JSX.Element {
    const { ipcRenderer } = window.require('electron');
    const [platform, setPlatform] = useState<string>('darwin');

    const onMinimizeWindow = () => {
        ipcRenderer.send('minimizeWindow');
    };

    const onCloseWindow = () => {
        ipcRenderer.send('closeWindow');
    };

    useEffect(() => {
        ipcRenderer.send('getOsPlatform');
        ipcRenderer.once('getOsPlatform', (e: any, args: any) => {
            setPlatform(args);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className='
                navbar
                fixed 
                w-full 
                bg-gray-200
                dark:bg-neutral-800
                z-10 
            '
        >
            <div 
                className={`
                    flex
                    py-2 
                    px-3
                    ${
                        platform === 'win32' ? 
                        'pl-5' : 
                        'pl-[50px]'
                    }
                    border-b-[1px]
                    border-neutral-300
                    dark:border-neutral-600
                    items-center
                `}
            >
                <div 
                    className={`
                        flex 
                        flex-row 
                        ${
                            platform === 'win32' ? 
                            'justify-start' : 
                            'justify-center'
                        }
                        gap-3
                        text-sm
                        h-[17px]
                        font-semibold
                        text-dark
                        dark:text-white
                        grow
                    `}
                >
                    <div 
                        className='
                            flex 
                            items-center
                            gap-1
                        '
                    >
                        <IoLogoInstagram />
                        <p>Instagram crawler</p>
                    </div>

                    {platform === 'win32' && (
                        <NavbarMenu 
                            onMinimizeWindow={onMinimizeWindow}
                            onCloseWindow={onCloseWindow}
                        />
                    )}
                </div>

                {platform === 'win32' && (
                    <NavbarButton 
                        onMinimizeWindow={onMinimizeWindow}
                        onCloseWindow={onCloseWindow}
                    />
                )}
            </div>
        </div> 
    )
}