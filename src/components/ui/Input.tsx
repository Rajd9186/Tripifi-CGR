"use client";

import * as React from "react";
import { cn, generateId } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", label, error, hint, icon, iconPosition = "left", id, disabled, required, ...props },
    ref
  ) => {
    const inputId = id || `input-${generateId()}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "field",
              iconPosition === "left" && icon && "pl-11",
              iconPosition === "right" && icon && "pr-11",
              error && "!border-error focus:!ring-error/40",
              className
            )}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-dim"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-text-dim">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, disabled, required, ...props }, ref) => {
    const textareaId = id || `textarea-${generateId()}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          required={required}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            "field min-h-[100px] resize-y",
            error && "!border-error",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="mt-1 text-xs text-text-dim">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export default Input;
