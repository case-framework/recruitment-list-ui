import { AlertCircle } from 'lucide-react';
import React from 'react';

interface ErrorAlertProps {
    title: string;
    description: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = (props) => {
    return (
        <div className='my-12 space-y-2'>
            <p className="text-destructive text-xl font-semibold flex flex-col sm:flex-row items-center gap-2">
                <span>
                    <AlertCircle className='size-8' />
                </span>
                {props.title}
            </p>
            <p>
                {props.description}
            </p>
        </div >
    );
};

export default ErrorAlert;
