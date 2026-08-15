import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { Tabs } from './Tabs.js';

expect.extend(toHaveNoViolations);

function TestTabs({ defaultValue = 'tab1' }: { defaultValue?: string }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <Tabs.List aria-label="Account Settings">
        <Tabs.Trigger value="tab1">Account</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Password</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Notifications</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">Account Details Panel</Tabs.Content>
      <Tabs.Content value="tab2">Password Change Panel</Tabs.Content>
      <Tabs.Content value="tab3">Notifications Preferences Panel</Tabs.Content>
    </Tabs>
  );
}

describe('Tabs Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders initial active tab panel based on defaultValue', () => {
    render(<TestTabs defaultValue="tab1" />);

    expect(screen.getByRole('tablist')).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Account Details Panel');
    expect(screen.queryByText('Password Change Panel')).toBeNull();
  });

  it('switches active tab and panel on click', async () => {
    const user = userEvent.setup();
    render(<TestTabs defaultValue="tab1" />);

    const passwordTab = screen.getByRole('tab', { name: 'Password' });
    await user.click(passwordTab);

    expect(passwordTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Password Change Panel');
  });

  it('supports keyboard arrow navigation between tabs', async () => {
    const user = userEvent.setup();
    render(<TestTabs defaultValue="tab1" />);

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    accountTab.focus();
    expect(document.activeElement).toBe(accountTab);

    await user.keyboard('{ArrowRight}');
    const passwordTab = screen.getByRole('tab', { name: 'Password' });
    expect(document.activeElement).toBe(passwordTab);
    expect(screen.getByRole('tabpanel').textContent).toContain('Password Change Panel');
  });

  it('has correct ARIA attributes linking triggers and panels', () => {
    render(<TestTabs defaultValue="tab1" />);

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const panel = screen.getByRole('tabpanel');

    const panelId = panel.getAttribute('id');
    const triggerId = accountTab.getAttribute('id');

    expect(accountTab.getAttribute('aria-controls')).toBe(panelId);
    expect(panel.getAttribute('aria-labelledby')).toBe(triggerId);
  });

  it('passes axe-core accessibility check with zero violations', async () => {
    const { container } = render(<TestTabs />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
