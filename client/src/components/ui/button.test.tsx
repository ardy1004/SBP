import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for loading spinner
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('supports accessibility attributes', () => {
    render(
      <Button aria-label="Custom label" aria-describedby="description">
        Click me
      </Button>
    );

    const button = screen.getByRole('button', { name: /custom label/i });
    expect(button).toHaveAttribute('aria-describedby', 'description');
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-8');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-10');
  });

  it('prevents clicks when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('prevents clicks when loading', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);

    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Keyboard</Button>);

    const button = screen.getByRole('button', { name: /keyboard/i });

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('forwards additional props to button element', () => {
    render(<Button data-testid="custom-button" type="submit">Submit</Button>);

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});