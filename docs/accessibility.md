# Accessibility Guide

## Overview

iStock is designed to be accessible to all users, following WCAG 2.1 Level AA standards. This document outlines accessibility features, keyboard shortcuts, and testing guidelines.

## Keyboard Shortcuts

### Global Shortcuts

- **Alt + M**: Skip to main content
- **Alt + N**: Skip to navigation
- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward through interactive elements
- **Enter / Space**: Activate buttons and links
- **Escape**: Close modals, sheets, and dialogs
- **Arrow Keys**: Navigate within lists and navigation menus
- **Home**: Jump to first item in a list
- **End**: Jump to last item in a list

### Chat Interface

- **Enter**: Send message (without Shift)
- **Shift + Enter**: New line in message input
- **Escape**: Close chat history sheet

### Navigation

- **Arrow Up/Down**: Navigate navigation menu items
- **Enter**: Activate selected navigation item

## Screen Reader Support

### Live Regions

The application uses ARIA live regions to announce dynamic content:

- **Chat Messages**: New messages are announced with `aria-live="polite"`
- **Errors**: Error messages are announced with `aria-live="assertive"`
- **Loading States**: Loading indicators have `role="status"`

### Semantic HTML

We use semantic HTML elements for better screen reader support:

- `<nav>` for navigation
- `<main>` for main content
- `<article>` for messages and content
- `<section>` for page sections
- `<aside>` for sidebar content

### ARIA Attributes

Common ARIA attributes used throughout the application:

- `aria-label`: Provides accessible name for icon-only buttons
- `aria-labelledby`: Links elements to labels
- `aria-describedby`: Links elements to descriptions
- `aria-current`: Indicates current page/item
- `aria-live`: Announces dynamic content updates
- `aria-busy`: Indicates loading state
- `aria-expanded`: Indicates expandable/collapsible state
- `aria-controls`: Links controls to controlled elements

## Focus Management

### Visible Focus Indicators

All interactive elements have visible focus indicators:
- Focus rings using `focus:ring-2` Tailwind classes
- High contrast colors for visibility
- Consistent styling across all components

### Focus Order

Focus order follows logical reading order:
1. Skip links (top of page)
2. Navigation
3. Main content
4. Footer actions

### Focus Trapping

Modals and sheets use focus trapping to keep focus within the modal:
- `FocusTrap` component manages focus
- Tab key cycles within modal
- Escape key closes modal and returns focus

## Skip Links

Skip links allow keyboard users to quickly navigate:

- **Skip to main content**: Bypasses navigation
- **Skip to navigation**: Jumps to navigation menu

These links are visually hidden until focused.

## Color Contrast

All text meets WCAG AA contrast requirements:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear visual distinction

## Testing Checklist

### Automated Testing

- [ ] Run Lighthouse accessibility audit (target: 90+)
- [ ] Use axe DevTools browser extension
- [ ] Check color contrast ratios
- [ ] Validate HTML with W3C validator

### Manual Keyboard Testing

- [ ] Navigate entire application with keyboard only
- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Skip links work correctly
- [ ] Modals trap focus properly
- [ ] All shortcuts work as expected

### Screen Reader Testing

Test with at least one screen reader:

- **Windows**: NVDA (free)
- **Mac**: VoiceOver (built-in)
- **Browser**: Chrome/Firefox with screen reader

Checklist:
- [ ] All content is readable
- [ ] Form labels are announced
- [ ] Button purposes are clear
- [ ] Navigation structure is clear
- [ ] Error messages are announced
- [ ] Loading states are communicated
- [ ] Dynamic content updates are announced

### Visual Testing

- [ ] Zoom to 200% - layout remains usable
- [ ] Test with reduced motion preferences
- [ ] Verify focus indicators are visible
- [ ] Check that color is not the only indicator

## Accessibility Features by Component

### Navigation
- Keyboard navigation with arrow keys
- `aria-current="page"` for active route
- Clear focus indicators
- Skip links

### Chat Interface
- `role="log"` with `aria-live="polite"` for messages
- Keyboard navigation for chat history
- Form labels and descriptions
- Error announcements

### Forms
- All inputs have labels
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required`
- Validation feedback announced

### Modals/Sheets
- Focus trapping
- Escape key to close
- Return focus to trigger on close
- `aria-labelledby` for titles

### Buttons
- `aria-label` for icon-only buttons
- `aria-busy` for loading states
- Keyboard accessible (Enter/Space)

## Common Issues and Solutions

### Issue: Icon-only buttons not announced
**Solution**: Add `aria-label` attribute

### Issue: Focus lost when opening modal
**Solution**: Use `FocusTrap` component

### Issue: Dynamic content not announced
**Solution**: Use `aria-live` regions or `useLiveRegion` hook

### Issue: Form errors not announced
**Solution**: Link errors with `aria-describedby` and use `role="alert"`

### Issue: Keyboard navigation broken
**Solution**: Ensure proper tab order and use `tabIndex` appropriately

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Reporting Accessibility Issues

If you encounter accessibility issues:

1. Document the issue with steps to reproduce
2. Note which assistive technology you're using
3. Report through project issue tracker
4. Include screenshots or screen reader logs if helpful

## Maintenance

- Regular accessibility audits (monthly recommended)
- Test new features with keyboard and screen reader
- Keep dependencies updated (especially Radix UI)
- Review and update this documentation as needed

