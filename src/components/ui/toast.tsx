"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {}

const Toast = ({ ...props }: ToastProps) => {
  return <ToastPrimitive.Root {...props} />;
};
Toast.displayName = ToastPrimitive.Root.displayName;

interface ToastViewportProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> {}
const ToastViewport = ({ className, ...props }: ToastViewportProps) => (
  <ToastPrimitive.Viewport
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:p-6",
      "max-w-[420px] w-full",
      className
    )}
    {...props}
  />
);
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action> {}
const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Action>, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Action
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-caption font-medium",
        "bg-surface hover:bg-surface-hover border border-border transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-cyan/50",
        className
      )}
      {...props}
    />
  )
);
ToastAction.displayName = ToastPrimitive.Action.displayName;

interface ToastCloseProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> {}
const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Close>, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-lg p-1 text-text-muted hover:text-text hover:bg-surface",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/50",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitive.Close>
  )
);
ToastClose.displayName = ToastPrimitive.Close.displayName;

interface ToastTitleProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title> {}
const ToastTitle = ({ className, ...props }: ToastTitleProps) => (
  <ToastPrimitive.Title className={cn("font-medium text-body text-text", className)} {...props} />
);
ToastTitle.displayName = ToastPrimitive.Title.displayName;

interface ToastDescriptionProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description> {}
const ToastDescription = ({ className, ...props }: ToastDescriptionProps) => (
  <ToastPrimitive.Description className={cn("text-body-sm text-text-muted", className)} {...props} />
);
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastContentProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const ToastContent = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastContentProps>(
  ({ className, variant = "default", title, description, action, ...props }, ref) => {
    const variants = {
      default: "bg-surface border border-border",
      success: "bg-success/10 border border-success/30",
      error: "bg-error/10 border border-error/30",
      warning: "bg-warning/10 border border-warning/30",
      info: "bg-cyan/10 border border-cyan/30",
    };

    const icons = {
      default: null,
      success: <CheckCircle className="h-5 w-5 text-success" />,
      error: <AlertCircle className="h-5 w-5 text-error" />,
      warning: <AlertTriangle className="h-5 w-5 text-warning" />,
      info: <Info className="h-5 w-5 text-cyan" />,
    };

    return (
      <ToastPrimitive.Root
        ref={ref}
        className={cn(
          "glass rounded-xl p-4 gap-3",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
          "data-[state=open]:slide-in-from-top-full data-[state=open]:slide-in-from-bottom-full",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{icons[variant]}</div>
          <div className="flex-1 min-w-0">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </div>
        {action && <div className="mt-3 pt-3 border-t border-border">{action}</div>}
      </ToastPrimitive.Root>
    );
  }
);
ToastContent.displayName = "ToastContent";

/* ------------------------------------------------------------------ */
/*  Global toaster store + provider                                    */
/* ------------------------------------------------------------------ */

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastRecord extends Required<Pick<ToastOptions, "title">> {
  id: string;
  description?: string;
  variant?: ToastVariant;
  duration: number;
  open: boolean;
}

type ToastListener = (toasts: ToastRecord[]) => void;

let toastStore: ToastRecord[] = [];
const toastListeners = new Set<ToastListener>();

function emit() {
  toastListeners.forEach((l) => l(toastStore));
}

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).slice(2, 11);
  const record: ToastRecord = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: options.duration ?? 4000,
    open: true,
  };
  toastStore = [record, ...toastStore].slice(0, 4);
  emit();
  return id;
}

export function dismissToast(id: string) {
  toastStore = toastStore.map((t) => (t.id === id ? { ...t, open: false } : t));
  emit();
  setTimeout(() => {
    toastStore = toastStore.filter((t) => t.id !== id);
    emit();
  }, 300);
}

export function useToast() {
  return { toast, dismissToast };
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastRecord[]>(toastStore);

  React.useEffect(() => {
    const listener: ToastListener = (next) => setToasts([...next]);
    toastListeners.add(listener);
    setToasts([...toastStore]);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => (
        <ToastContent
          key={t.id}
          title={t.title}
          description={t.description}
          variant={t.variant}
          open={t.open}
          duration={t.duration}
          onOpenChange={(open) => {
            if (!open) dismissToast(t.id);
          }}
        />
      ))}
      <ToastViewport />
    </ToastPrimitive.Provider>
  );
}

export {
  Toast,
  ToastViewport,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};