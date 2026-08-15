/* eslint-disable no-unused-vars */
import * as React from 'react';

import { Portal } from '../Portal/Portal.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useScrollLock } from '../../hooks/useScrollLock.js';
import { cn } from '../../utils/cn.js';

interface DialogContextValue {
  open: boolean;
  setOpen: (_nextOpen: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (_hasDesc: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog sub-components must be nested within a <Dialog> provider.');
  }
  return context;
}

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (_nextOpen: boolean) => void;
}

export function Dialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const titleId = React.useId();
  const descriptionId = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);

  return (
    <DialogContext.Provider
      value={{
        open,
        setOpen,
        titleId,
        descriptionId,
        hasDescription,
        setHasDescription,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

function DialogTrigger({ children }: DialogTriggerProps) {
  const { setOpen } = useDialogContext();

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(e);
      setOpen(true);
    },
  });
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, externalRef) => {
    const { open, setOpen, titleId, descriptionId, hasDescription } = useDialogContext();
    const internalRef = React.useRef<HTMLDivElement>(null);
    const contentRef = (externalRef as React.RefObject<HTMLDivElement>) || internalRef;

    // Apply focus trap and body scroll lock when open
    useFocusTrap(contentRef, open);
    useScrollLock(open);

    // Listen for Escape key to close dialog
    React.useEffect(() => {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          setOpen(false);
        }
      }

      if (open) {
        window.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <Portal>
        {/* Backdrop Overlay */}
        {}
        <div
          data-testid="dialog-backdrop"
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-[var(--color-background-overlay,#00000080)] backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
        {/* Centered Modal Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={hasDescription ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              'relative w-full max-w-lg rounded-[var(--radius-lg,0.5rem)] bg-[var(--color-background-default,#ffffff)] p-6 shadow-lg border border-[var(--color-border-default,#e5e7eb)] focus:outline-none',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      </Portal>
    );
  }
);

DialogContent.displayName = 'Dialog.Content';

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => {
    const { titleId } = useDialogContext();
    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn('text-lg font-semibold text-[var(--color-text-primary,#111827)]', className)}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

DialogTitle.displayName = 'Dialog.Title';

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useDialogContext();

    React.useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);

    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn('mt-2 text-sm text-[var(--color-text-secondary,#4b5563)]', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

DialogDescription.displayName = 'Dialog.Description';

export interface DialogCloseProps {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

function DialogClose({ children }: DialogCloseProps) {
  const { setOpen } = useDialogContext();

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(e);
      setOpen(false);
    },
  });
}

Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Close = DialogClose;
