import { useCallback, useState } from 'react';

export function usePopup(defaultOpen = false) {
  const [isOpen, setOpen] = useState(defaultOpen);

  const openPopup = useCallback(() => {
    setOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setOpen(false);
  }, []);

  const togglePopup = useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  return {
    isOpen,
    setOpen,
    openPopup,
    closePopup,
    togglePopup,
  };
}
