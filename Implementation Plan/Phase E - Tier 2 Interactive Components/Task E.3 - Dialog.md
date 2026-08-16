# Task E.3 — Dialog

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** D.2, E.1, E.2  
**Blocks:** Component overlays  
**Week:** 6  
**AI Skill to use:** `senior-frontend`, `architecture-patterns`

---

## 1. What I'm Building

An accessible modal dialog component (`Dialog`) using the compound component pattern. It integrates portals (D.2), focus traps (E.1), scroll locks (E.2), and WAI-ARIA states.

---

## 2. Architectural Decisions & Trade-offs

- **React Context state coordination**: The root `<Dialog>` component holds state (`open`/`onOpenChange`) and exposes it to sub-elements (`Dialog.Trigger`, `Dialog.Content`, `Dialog.Close`) via context. This avoids passing props manually.
- **Portalled overlay trees**: Dialog contents render inside the `Portal` component to avoid parent visual overflow clipping.
- **WAI-ARIA Accessibility**: We declare `role="dialog"`, `aria-modal="true"`, and link descriptions using `aria-labelledby` / `aria-describedby` attributes.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Dialog/Dialog.tsx`

Create the compound components:

```typescript
import * as React from 'react';
import { Portal } from '../Portal/Portal';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { cn } from '../../utils/cn';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
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
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: DialogProps) {
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

  return (
    <DialogContext.Provider value={{ open, setOpen, titleId, descriptionId }}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

Dialog.Trigger = function DialogTrigger({ children }: DialogTriggerProps) {
  const { setOpen } = useDialogContext();

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      setOpen(true);
    },
  });
};

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

Dialog.Content = function DialogContent({ className, children, ...props }: DialogContentProps) {
  const { open, setOpen, titleId, descriptionId } = useDialogContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Apply focus trap and scroll lock
  useFocusTrap(contentRef, open);
  useScrollLock(open);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
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
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[var(--color-background-overlay)]/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      {/* Dialog container box */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            'relative w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--color-background-default)] p-6 shadow-[var(--shadow-lg)] border border-[var(--color-border-default)] focus:outline-none',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
};

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

Dialog.Title = function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  const { titleId } = useDialogContext();
  return (
    <h2
      id={titleId}
      className={cn('text-lg font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]', className)}
      {...props}
    >
      {children}
    </h2>
  );
};

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

Dialog.Description = function DialogDescription({ className, children, ...props }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext();
  return (
    <p
      id={descriptionId}
      className={cn('text-sm text-[var(--color-text-secondary)] mt-2', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export interface DialogCloseProps {
  children: React.ReactElement;
}

Dialog.Close = function DialogClose({ children }: DialogCloseProps) {
  const { setOpen } = useDialogContext();
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      setOpen(false);
    },
  });
};
```

### 2. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { Dialog } from './components/Dialog/Dialog';
export type {
  DialogProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from './components/Dialog/Dialog';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Landmark Descriptions**: WAI-ARIA states that a dialog content node must declare `aria-describedby` when helper text exists. If a Dialog contains no descriptions, omit the attribute to avoid screen reader errors.
- **Z-Index Layering**: Always ensure the modal container has an explicit high z-index (e.g. `z-50`) to avoid being hidden behind neighboring layouts.

---

## 5. Definition of Done

- [ ] `Dialog` compound component exists.
- [ ] Overlays render outside parent paths via `Portal`.
- [ ] Active modals lock background scroll and trap keyboard focus.
- [ ] Pressing ESC closes active modals and returns focus to triggers.
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                | Command                             | Expected Result                                                                   |
| ----------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| Verify rendering output | Click trigger button                | Overlay opens in body, backdrop mounts, and focus moves to first focusable child. |
| Verify focus wrapping   | Tab from close button inside modal  | Focus wraps inside the dialog to the next focusable item.                         |
| Verify scroll locks     | Scroll page when modal is active    | Document scroll position is locked.                                               |
| Test closing behavior   | Press ESC or click backdrop overlay | Dialog overlay unmounts and focus returns to the original trigger.                |

---

## 7. AI Code Loop Prompt

```
TASK: E.3 — Dialog

Create packages/core/src/components/Dialog/Dialog.tsx.
Support Dialog.Trigger, Dialog.Content, Dialog.Title, Dialog.Description, and Dialog.Close compound components.
Integrate react Portal, useFocusTrap, and useScrollLock.
Manage open/close states inside Context, supporting controlled and uncontrolled modes.
Define WAI-ARIA roles, setting role="dialog", aria-modal="true", and linking titleId and descriptionId via useId.
Create Dialog.test.tsx containing keyboard wrappers checks, ESC closures, backdrop clicks, and an accessibility scan.
Update core index.ts to export Dialog and its typings.
```
