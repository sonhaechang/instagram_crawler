import { JSX } from 'react';
import { Dropdown } from '../elements';


interface Props {
    onMinimizeWindow: () => void,
    onCloseWindow: () => void,
}

interface NavbarMenuItemProps {
    title: string,
    subTitle?: string | null
}

function NavbarMenuItem({
    title,
    subTitle
}: NavbarMenuItemProps): JSX.Element {
    return (
        <div 
            className='
                flex 
                gap-1 
                items-center 
                justify-between
                text-xs 
                w-full
            '
        >
            <div>{title}</div>

            {subTitle && (<div>{subTitle}</div>)}
        </div>
    )
}

export default function NavbarMenu({
    onMinimizeWindow,
    onCloseWindow
}: Props): JSX.Element {
    const { ipcRenderer, shell } = window.require('electron');

    const fileMenus = [
        {
            title: (
                <NavbarMenuItem 
                    title={'크롬드라이버 폴더 열기'}
                    subTitle='Ctrl + Shift + C'
                />
            ),
            onClick: () => {ipcRenderer.send('openDriverDir')},
        },
        {
            title: (
                <NavbarMenuItem 
                    title={'결과 파일 폴더 열기'}
                    subTitle='Ctrl + Shift + R'
                />
            ),
            onClick: () => {ipcRenderer.send('openResultsDir')},
        },
        {
            title: (
                <NavbarMenuItem 
                    title={'해시태그 블랙리스트 폴더 열기'}
                    subTitle='Ctrl + Shift + H'
                />
            ),
            onClick: () => {ipcRenderer.send('openBlacklistDir')},
        },
    ];

    const viewMenus = [
        {
            title: (
                <NavbarMenuItem 
                    title={'Toggle Developer Tools'}
                    subTitle='Ctrl + Shift + I'
                />
            ),
            onClick: () => {ipcRenderer.send('toggleDevTools')},
        },
        {
            title: (
                <NavbarMenuItem 
                    title={'확대'}
                    subTitle='Ctrl + +'
                />
            ),
            onClick: () => {ipcRenderer.send('zoomInOutWindow', 'in')},
        },
        {
            title: (
                <NavbarMenuItem 
                    title={'축소'}
                    subTitle='Ctrl + -'
                />
            ),
            onClick: () => {ipcRenderer.send('zoomInOutWindow', 'out')},
        },
    ];

    const windowMenus = [
        {
            title: (
                <NavbarMenuItem 
                    title={'최소화'}
                    subTitle='Ctrl + M'
                />
            ),
            onClick: () => {onMinimizeWindow()},
        },
        {
            title: (
                <NavbarMenuItem 
                    title={'종료'}
                    subTitle='Ctrl + Q'
                />
            ),
            onClick: () => {onCloseWindow()},
        },
    ];
    
    const helpMenus = [
        {
            title: (
                <NavbarMenuItem 
                    title={'Instagram crawler 정보'}
                />
            ),
            onClick: () => {ipcRenderer.send('showAboutPanel')},
        },
        {
            title: (
                <NavbarMenuItem 
                    title={'더 알아보기'}
                />
            ),
            onClick: () => {shell.openExternal('https://electronjs.org')},
        },
    ];

    const dropDowns = [
        {title: '파일', width: 'w-80', menus: fileMenus}, 
        {title: '보기', menus: viewMenus}, 
        {title: '창', menus: windowMenus}, 
        {title: '도움말', menus: helpMenus}
    ];

    return (
        <div 
            className='
                navbar-item
                flex 
                flex-row 
            '
        >
            {dropDowns.map((dropDown, idx) => (
                <Dropdown
                    key={idx}
                    title={dropDown.title}
                    btnPadding='px-2'
                    menuBgColor={`
                        bg-white
                        dark:bg-neutral-800
                    `}
                    menuWidth={dropDown?.width}
                    menus={dropDown.menus}
                    isScroll={false} 
                    btnOutline
                    small
                />
            ))}
        </div>
    );
}