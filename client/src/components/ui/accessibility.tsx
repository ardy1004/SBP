import React from 'react';

/**
 * ScreenReaderOnly - Content that is visually hidden but available to screen readers
 */
export const ScreenReaderOnly: React.FC<React.PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
}>> = ({ children, as: Component = 'span' }) => {
  const ComponentTag = Component as any;

  return (
    <ComponentTag
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {children}
    </ComponentTag>
  );
};

/**
 * LiveRegion - Announces dynamic content changes to screen readers
 */
export const LiveRegion: React.FC<React.PropsWithChildren<{
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-atomic'?: boolean;
}>> = ({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true
}) => (
  <div
    aria-live={ariaLive}
    aria-atomic={ariaAtomic}
    style={{
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    }}
  >
    {children}
  </div>
);

/**
 * SkipLink - Allows keyboard users to skip to main content
 */
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
  >
    {children}
  </a>
);

/**
 * FocusTrap - Manages focus within a modal or dialog
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close modal/dropdown logic should be handled by parent component
        // This just provides the keyboard handling
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
};