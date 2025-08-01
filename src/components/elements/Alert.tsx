import { JSX, useContext } from 'react';
import Modal from './Modal';
import Message from './Message';
import { AlertContext } from '../../providers/AlertProvider';
import Button from './Button';


export default function Alert(): JSX.Element {
    const {
        isOpen,
        setIsOpen,
        type,
        setType,
        message,
        setMessage,
        actionLabel,
        setActionLabel,
        secondaryActionLabel,
        setSecondaryActionLabel,
        action,
        setAction,
        secondaryAction,
        setSecondaryAction,
        isConfirm,
        setIsConfirm,
    } = useContext(AlertContext);

    const onCloseHandler = () => {
        setIsOpen(prev => false);
        setType('success');
        setMessage('');
        setActionLabel('확인');
        setSecondaryActionLabel('취소');
        setAction(null);
        setIsConfirm(false);
        setSecondaryAction(null);
    }

    return (
        <Modal 
            isOpen={isOpen}
            onModalClose={onCloseHandler}
            isHeader={false}
        >
            <>
                <Message 
                    type={type}
                    message={message}
                />
                <div 
                    className='
                        flex 
                        justify-end
                    '
                >
                <div 
                    className={`
                        flex 
                        gap-2
                        ${isConfirm ? 'w-full' : 'w-32'}
                    `}
                >
                    {isConfirm && (
                        <Button 
                            title={secondaryActionLabel}
                            onClick={
                                secondaryAction === null ? 
                                onCloseHandler : 
                                secondaryAction
                            }
                        />
                    )}
                    <Button 
                        title={actionLabel}
                        btnClass='
                            bg-indigo-600 
                            text-white 
                            hover:bg-indigo-500
                            focus-visible:outline-indigo-600 
                        '
                        onClick={
                            action === null ? 
                            onCloseHandler : 
                            action
                        }
                    />
                </div>
                </div>
            </>
        </Modal>
    )
}