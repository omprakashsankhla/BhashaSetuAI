import { useEffect, useRef } from 'react';

/**
 * A custom hook to trap focus within a modal container.
 * 
 * @param {boolean} isActive - Whether the focus trap is currently active.
 * @param {function} onClose - Function to call when the Escape key is pressed.
 * @returns {React.MutableRefObject} - A ref to be attached to the modal container.
 */
export const useFocusTrap = (isActive, onClose) => {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Save the element that was focused before the modal opened
    previouslyFocusedElement.current = document.activeElement;

    // Focus the first focusable element inside the modal
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    const handleKeyDown = (e) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        if (onClose) onClose();
        return;
      }

      // Handle Tab key for focus trapping
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } 
        // Tab
        else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function runs on unmount or when isActive changes to false
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the original element
      if (previouslyFocusedElement.current?.isConnected) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive, onClose]);

  return modalRef;
};
