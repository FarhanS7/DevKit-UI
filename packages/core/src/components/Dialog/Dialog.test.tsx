import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { Dialog } from './Dialog.js';

expect.extend(toHaveNoViolations);

function TestDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <Dialog.Trigger>
        <button id="trigger">Open Dialog</button>
      </Dialog.Trigger>
      <Dialog.Content data-testid="dialog-content">
        <Dialog.Title>Edit Profile</Dialog.Title>
        <Dialog.Description>
          Make changes to your profile here. Click save when you are done.
        </Dialog.Description>
        <div className="mt-4 flex justify-end gap-2">
          <Dialog.Close>
            <button id="cancel-btn">Cancel</button>
          </Dialog.Close>
          <button id="save-btn">Save Changes</button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

describe('Dialog Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders trigger button initially and content when open', async () => {
    const user = userEvent.setup();
    render(<TestDialog />);

    expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeDefined();
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Edit Profile' })).toBeDefined();
    expect(screen.getByText(/Make changes to your profile/i)).toBeDefined();
  });

  it('closes dialog when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestDialog defaultOpen={true} />);

    expect(screen.getByRole('dialog')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes dialog when ESC key is pressed', async () => {
    const user = userEvent.setup();
    render(<TestDialog defaultOpen={true} />);

    expect(screen.getByRole('dialog')).toBeDefined();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes dialog when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<TestDialog defaultOpen={true} />);

    expect(screen.getByRole('dialog')).toBeDefined();

    const backdrop = screen.getByTestId('dialog-backdrop');
    await user.click(backdrop);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('has correct ARIA attributes and links title and description', () => {
    render(<TestDialog defaultOpen={true} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const title = screen.getByRole('heading', { name: 'Edit Profile' });
    const titleId = title.getAttribute('id');
    expect(titleId).toBeTruthy();
    expect(dialog.getAttribute('aria-labelledby')).toBe(titleId);

    const description = screen.getByText(/Make changes to your profile/i);
    const descriptionId = description.getAttribute('id');
    expect(descriptionId).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBe(descriptionId);
  });

  it('passes axe-core accessibility check with zero violations when open', async () => {
    const { container } = render(<TestDialog defaultOpen={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
