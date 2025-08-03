'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Enhanced Input variants using class-variance-authority
const inputVariants = cva(
  [
    'flex',
    'w-full',
    'rounded-lg',
    'border',
    'bg-white',
    'px-4',
    'py-3',
    'text-base', // Enhanced from text-sm for better mobile readability
    'sm:text-sm', // Smaller text on larger screens
    'transition-all',
    'duration-300',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-1',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'placeholder:text-slate-400',
    'hover:border-slate-400',
    'peer',
    'min-h-[44px]', // Ensure minimum touch target size
    'touch-manipulation' // Optimize for touch interaction
  ],
  {
    variants: {
      variant: {
        default: 'border-slate-300 focus-visible:ring-primary-500 focus-visible:border-primary-500 shadow-sm hover:shadow-md focus:shadow-lg',
        modern: 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:shadow-md focus:shadow-lg',
        floating: 'border-slate-300 bg-transparent focus:border-emerald-500 focus:ring-emerald-500/20 pt-6 pb-2 shadow-sm hover:shadow-md focus:shadow-lg',
        error: 'border-red-400 text-red-900 placeholder-red-400 focus-visible:ring-red-500 focus-visible:border-red-500 shadow-sm hover:shadow-md focus:shadow-lg bg-red-50/50',
        success: 'border-emerald-400 text-emerald-900 placeholder-emerald-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm hover:shadow-md focus:shadow-lg bg-emerald-50/50'
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Enhanced Input component props
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  floating?: boolean;
}

// Enhanced Input component
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    label, 
    error, 
    success, 
    helperText, 
    leftIcon, 
    rightIcon, 
    containerClassName, 
    floating = false, 
    id, 
    ...props 
  }, ref) => {
    const inputVariant = error ? 'error' : success ? 'success' : floating ? 'floating' : variant;
    const uniqueId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={cn("relative w-full", containerClassName)}>
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10">
              {leftIcon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            id={uniqueId}
            className={cn(
              inputVariants({ variant: inputVariant }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              floating && label && "placeholder-transparent",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10">
              {rightIcon}
            </div>
          )}
          
          {/* Floating Label */}
          {floating && label ? (
            <label
              htmlFor={uniqueId}
              className={cn(
                "absolute text-sm transition-all duration-300 transform origin-left pointer-events-none",
                "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0",
                "peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-emerald-600",
                "peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-4",
                leftIcon ? "left-10 top-4" : "left-4 top-4",
                error ? "peer-focus:text-red-600" : "peer-focus:text-emerald-600",
                props.value || props.defaultValue ? "scale-75 -translate-y-4 text-emerald-600" : "text-slate-500"
              )}
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          ) : (
            // Standard Label
            label && (
              <label 
                htmlFor={uniqueId} 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )
          )}
        </div>
        
        {/* Status Messages */}
        <div className="mt-2 min-h-[20px]">
          {error && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && !error && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-emerald-600">Looks good!</p>
            </div>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-slate-500">{helperText}</p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';

// Textarea variants and component
const textareaVariants = cva(
  [
    'flex',
    'w-full',
    'rounded-md',
    'border',
    'bg-white',
    'px-3',
    'py-2',
    'text-sm',
    'transition-all',
    'duration-200',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50'
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-blue-500',
        modern: 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-green-500',
        error: 'border-red-500 text-red-900 placeholder-red-700 focus-visible:ring-red-500',
        success: 'border-green-500 text-green-900 placeholder-green-700 focus-visible:ring-green-500'
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, label, error, containerClassName, id, ...props }, ref) => {
    const textareaVariant = error ? 'error' : variant;
    
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          className={cn(textareaVariants({ variant: textareaVariant }), className)}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants, textareaVariants }; 