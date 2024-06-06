import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';
import { Slot } from '@radix-ui/react-slot';

import { SexyBoarder } from '../sexy-boarder';

const buttonVariants = cva(
  'w-fit inline-flex items-center justify-center whitespace-nowrap text-sm rounded-md font-alt font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        orange: 'bg-orange-500 hover:bg-orange-400',
        sexy: 'transition-all bg-black hover:bg-opacity-0',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <WithSexyBorder variant={variant} className={cn('w-fit', className)}>
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
      </WithSexyBorder>
    );
  }
);
Button.displayName = 'Button';

export function WithSexyBorder({
  variant,
  className,
  children,
}: {
  variant: string | null | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  if (variant === 'sexy') {
    return <SexyBoarder className={className}>{children}</SexyBoarder>;
  } else {
    return <>{children}</>;
  }
}

export { Button, buttonVariants };
