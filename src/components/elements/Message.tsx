import { BsExclamationLg } from 'react-icons/bs';
import { BsQuestionLg } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import { FaXmark } from 'react-icons/fa6';


interface Props {
    type: string;
    message: string;
}

export default function Message({ type, message }: Props) {
    const messageType = {
        success: {
            class: 'text-green-600 bg-green-100',
            icon: <FaCheck size={24} />
        },
        question: {
            class: 'text-indigo-600 bg-indigo-100',
            icon: <BsQuestionLg size={24} />
        },
        warning: {
            class: 'text-yellow-500 bg-yellow-100',
            icon: <BsExclamationLg size={24} />
        },
        error: {
            class: 'text-red-600 bg-red-100',
            icon: <FaXmark size={24} />
        }
    }

    return (
        <div 
            className='
                flex
                items-center
                pb-10
            '
        >
            <div className='w-[15%]'>
                <div 
                    className={`
                        w-10 
                        h-10 
                        flex 
                        justify-center 
                        items-center 
                        rounded-full 
                        ${
                            // @ts-ignore
                            messageType[type].class
                        }
                    `}
                >
                    {/* @ts-ignore */}
                    {messageType[type].icon}
                </div>
            </div>
            
            <div className='w-[85%]'>
                <div 
                    className='
                        text-gray-900
                        dark:text-white
                        text-sm
                        whitespace-pre-line
                    '
                >
                    {message}
                </div>
            </div>
        </div>
    );
}