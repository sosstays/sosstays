"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

// Radix Dialog — gets focus return, Escape-to-close, and scroll-lock as
// defaults instead of code maintained by hand (see the old PropertyGallery
// lightbox, which had none of the three despite looking like it did).
// Deliberately carries no color/layout opinions beyond overlay + centering
// mechanics, same reasoning as ui/tabs.tsx — each call site's dialog looks
// different enough (a full-bleed photo lightbox vs. a small confirm modal)
// that a single default chrome would fight more than it'd help.

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-near-black/95", className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn("fixed inset-0 z-50 overflow-y-auto outline-none", className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// Radix requires a Title (and warns without a Description) for screen
// readers even when the dialog has no visible heading — kept off-screen
// rather than skipped, so a lightbox etc. doesn't need to invent one.
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("sr-only", className)} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description data-slot="dialog-description" className={cn("sr-only", className)} {...props} />
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle, DialogDescription };
