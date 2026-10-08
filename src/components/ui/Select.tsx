"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Legacy native select (default export) — used across existing pages */
/* ------------------------------------------------------------------ */

interface NativeSelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export default function NativeSelect({
  label,
  value,
  onChange,
  children,
  className,
  id,
  name,
  disabled,
}: NativeSelectProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <select className="field" value={value} onChange={onChange} id={id} name={name} disabled={disabled}>
        {children}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Radix-based select (named exports) — used by the redesign          */
/* ------------------------------------------------------------------ */

export interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  className?: string;
  id?: string;
}

export function Select({
  label,
  placeholder,
  error,
  hint,
  className,
  id,
  children,
  disabled,
  required,
  ...props
}: SelectProps) {
  return (
    <div className="w-full" data-slot="select">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <SelectPrimitive.Root disabled={disabled} required={required} {...props}>
        <SelectPrimitive.Trigger
          id={id}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            "field flex items-center justify-between gap-2 text-left",
            error && "!border-error",
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-[120] max-h-96 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-card-hover"
          >
            <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center">
              <ChevronUp className="h-4 w-4 text-text-muted" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center">
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-xs text-text-dim">{hint}</p>}
    </div>
  );
}

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-4 pr-10 text-body-sm outline-none",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[highlighted]:bg-surface-hover data-[highlighted]:text-text",
      "data-[state=checked]:text-saffron",
      className
    )}
    {...props}
  >
    <span className="absolute right-3 flex h-5 w-5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-saffron" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";
