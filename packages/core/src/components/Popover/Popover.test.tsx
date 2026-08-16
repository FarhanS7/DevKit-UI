import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

import { Button } from '../Button/Button.js';

import { Popover } from './Popover.js';

expect.extend(toHaveNoViolations);

describe('Popover Component', () => {
  it('renders trigger initially and content when clicked', () => {
    render(
      <Popover>
        <Popover.Trigger>
          <Button>Open Popover</Button>
        </Popover.Trigger>
        <Popover.Content>
          <div>Popover Content Here</div>
        </Popover.Content>
      </Popover>
    );

    expect(screen.getByRole('button', { name: 'Open Popover' })).toBeInTheDocument();
    expect(screen.queryByText('Popover Content Here')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open Popover' }));
    expect(screen.getByText('Popover Content Here')).toBeInTheDocument();
  });

  it('calls onOpenChange handler', () => {
    const handleOpenChange = vi.fn();
    render(
      <Popover onOpenChange={handleOpenChange}>
        <Popover.Trigger>
          <Button>Toggle</Button>
        </Popover.Trigger>
        <Popover.Content>
          <div>Content</div>
        </Popover.Content>
      </Popover>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it('passes axe-core accessibility audit when open', async () => {
    const { container } = render(
      <Popover defaultOpen>
        <Popover.Trigger>
          <Button>Open</Button>
        </Popover.Trigger>
        <Popover.Content>
          <p>Accessible Popover Content</p>
        </Popover.Content>
      </Popover>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
