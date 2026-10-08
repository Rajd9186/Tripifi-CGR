"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

const Dialog = ({ children, ...props }: DialogProps) => {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
};
Dialog.displayName = DialogPrimitive.Root.displayName;

interface DialogTriggerProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {}
const DialogTrigger = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Trigger>, DialogTriggerProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Trigger ref={ref} className={cn("", className)} {...props} />
  )
);
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

interface DialogPortalProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal> {}
const DialogPortal = ({ children, ...props }: DialogPortalProps) => {
  return <DialogPrimitive.Portal {...props}>{children}</DialogPrimitive.Portal>;
};
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

interface DialogCloseProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {}
const DialogClose = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Close>, DialogCloseProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Close ref={ref} className={cn("", className)} {...props} />
  )
);
DialogClose.displayName = DialogPrimitive.Close.displayName;

interface DialogOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "max-w-[360px]",
      md: "max-w-[480px]",
      lg: "max-w-[640px]",
      xl: "max-w-[800px]",
      full: "max-w-[90vw]",
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-bg-elevated border border-border",
            "glass-strong p-6 shadow-card-hover",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            sizes[size],
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-3 top-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors focus:ring-2 focus:ring-cyan/50" aria-label="Close">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-2 mt-6", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("font-display text-display-sm font-semibold text-text tracking-tight", className)}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body text-text-muted", className)} {...props} />
  )
);
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};