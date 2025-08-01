import { createContext, Dispatch, SetStateAction, JSX, useState } from 'react';


interface Props {
    children: React.ReactNode;
}

interface ContextProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    type: string;
    setType: Dispatch<SetStateAction<string>>;
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
    actionLabel: string;
    setActionLabel: Dispatch<SetStateAction<string>>;
    secondaryActionLabel: string;
    setSecondaryActionLabel: Dispatch<SetStateAction<string>>;
    action: (() => void) | null;
    setAction: Dispatch<SetStateAction<(() => void) | null>>;
    secondaryAction: (() => void) | null;
    setSecondaryAction: Dispatch<SetStateAction<(() => void) | null>>;
    isConfirm: boolean;
    setIsConfirm: Dispatch<SetStateAction<boolean>>;
};

const defaultContextValue: ContextProps = {
    isOpen: false,
    setIsOpen: () => {},
    type: '',
    setType: () => {},
    message: '', 
    setMessage: () => {},
    actionLabel: '',
    setActionLabel: () => {},
    action: () => {},
    setAction: () => {},
    secondaryActionLabel: '',
    setSecondaryActionLabel: () => {},
    secondaryAction: () => {},
    setSecondaryAction: () => {},
    isConfirm: false,
    setIsConfirm: () => {},
};

export const AlertContext = createContext(defaultContextValue);

export default function AlertProvider({ children }: Props): JSX.Element {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [type, setType] = useState<string>('success');
    const [message, setMessage] = useState<string>('');
    const [actionLabel, setActionLabel] = useState<string>('확인');
    const [secondaryActionLabel, setSecondaryActionLabel] = useState<string>('취소');
    const [action, setAction] = useState<(() => void) | null>(null);
    const [secondaryAction, setSecondaryAction] = useState<(() => void) | null>(null);
    const [isConfirm, setIsConfirm] = useState<boolean>(false);

    return (
        <AlertContext.Provider 
            value={{
                isOpen: isOpen,
                setIsOpen: setIsOpen,
                type: type,
                setType: setType,
                message: message,
                setMessage: setMessage,
                actionLabel: actionLabel,
                setActionLabel: setActionLabel,
                secondaryActionLabel: secondaryActionLabel,
                setSecondaryActionLabel: setSecondaryActionLabel,
                secondaryAction: secondaryAction,
                setSecondaryAction: setSecondaryAction,
                action: action,
                setAction: setAction,
                isConfirm: isConfirm,
                setIsConfirm: setIsConfirm,
            }}
        >
            {children}
        </AlertContext.Provider>
    )
}