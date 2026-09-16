import { useState } from 'react';

export const useAppStore = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return {
    isOnline,
    setIsOnline,
    selectedCategory,
    setSelectedCategory,
  };
};

export default useAppStore;
