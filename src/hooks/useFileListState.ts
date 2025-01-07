import { useState } from 'react';

export const useFileListState = () => {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, setIsOpen };
};