import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

import type { FC, ReactNode } from 'react';

interface NotificationProps {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    description?: ReactNode;
    setShow: (show: boolean) => void;
}

const NotificationSimple: FC<NotificationProps> = ({
    type,
    message,
    description,
    setShow,
}) => {
    const icons = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />,
        error: <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />,
        info: <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />,
        warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />,
    };

    const bgColors = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-blue-50',
        warning: 'bg-yellow-50',
    };

    const ringColors = {
        success: 'ring-green-400',
        error: 'ring-red-400',
        info: 'ring-blue-400',
        warning: 'ring-yellow-400'
    };

    return (
        <div className={`pointer-events-auto w-full overflow-hidden rounded-lg shadow-lg ring-1 ${ringColors[type]} ring-opacity-5 ${bgColors[type]}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">{icons[type]}</div>
                    <div className="ml-3 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 break-words">{message}</p>
                        {description && <p className="mt-1 text-sm text-gray-500 break-words">{description}</p>}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setShow(false)}
                            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default NotificationSimple;
