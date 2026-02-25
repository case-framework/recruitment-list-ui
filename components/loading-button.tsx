import React from 'react';
import { Button } from './ui/button';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
    isLoading?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(({
    isLoading = false,
    disabled = false,
    className,
    children,
    ...props
}, ref) => {
    return (
        <Button
            ref={ref}
            disabled={isLoading || disabled}
            className={cn('flex items-center justify-center gap-2', className)}
            {...props}
        >
            {isLoading && <Loader2 className='animate-spin size-4' />}
            {children}
        </Button>
    );
});

LoadingButton.displayName = 'LoadingButton';


export default LoadingButton;
