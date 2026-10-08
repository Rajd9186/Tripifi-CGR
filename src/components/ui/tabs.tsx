"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: "default" | "pills" | "underline";
}

const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <TabsPrimitive.Root
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  )
);
Tabs.displayName = TabsPrimitive.Root.displayName;

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "pills" | "underline";
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-surface border border-border p-1 rounded-xl",
      pills: "bg-transparent p-0",
      underline: "bg-transparent p-0 border-b border-border",
    };

    return (
      <TabsPrimitive.List
        ref={ref}
        aria-label="Tabs"
        className={cn(
          "flex items-center gap-1",
          "data-[orientation=horizontal]:h-12",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    );
  }
);
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: "default" | "pills" | "underline";
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, variant = "default", children, disabled, ...props }, ref) => {
    const variants = {
      default: "data-[state=active]:bg-surface-hover data-[state=active]:text-text data-[state=active]:shadow-sm",
      pills: "data-[state=active]:bg-cyan/15 data-[state=active]:text-cyan data-[state=active]:border data-[state=active]:border-cyan/30",
      underline: "data-[state=active]:text-cyan data-[state=active]:border-b-2 data-[state=active]:border-cyan pb-3",
    };

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center gap-1.5 font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-offset-2 focus:ring-offset-bg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "rounded-lg px-4 py-2 text-body-sm",
          variant === "pills" && "rounded-xl",
          variant === "underline" && "rounded-none border-b-2 border-transparent -mb-px",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    );
  }
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 ring-offset-bg focus:outline-none",
        "data-[state=active]:animate-in data-[state=inactive]:animate-out",
        "data-[state=inactive]:fade-out data-[state=active]:fade-in",
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };