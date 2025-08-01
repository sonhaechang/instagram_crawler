import { Dispatch, JSX, SetStateAction, useEffect, useState } from 'react';
import { Radio } from '../../elements';


interface Props {
    selectedOption: string;
    setSelectedOption: Dispatch<SetStateAction<string>>;
}

export default function SelectFile({
    selectedOption,
    setSelectedOption
}: Props): JSX.Element {
    const { ipcRenderer } = window.require('electron');
    const [fileNames, setFileNames] = useState<string[]>([]);
    
    const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(e.target.value);
    };

    useEffect(() => {
        ipcRenderer.send('getResultFileNames');
        ipcRenderer.once('getResultFileNames', (e: any, args: any) => {
            setFileNames(args);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div 
            className='
                mt-5
                w-full
                h-52
                rounded-md 
                border-[1px]
                border-gray-300
                p-3
                space-y-3
                overflow-scroll
                bg-white
            '
        >
            {fileNames.map((name: string, idx: number) => (
                <Radio 
                    key={idx}
                    title={name}
                    value={name}
                    selectedOption={selectedOption}
                    onChange={onHandleChange}
                />
            ))}
        </div>
    );
}