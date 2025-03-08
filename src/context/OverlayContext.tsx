"use client";

import { createContext, useContext, useState } from "react";

type OverlayContextType = {
  showOverlay: boolean;
  toggleOverlay: (show: boolean) => void;
};

const OverlayContext = createContext<OverlayContextType>({
  showOverlay: false,
  toggleOverlay: () => {}
});

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = (show: boolean) => {
    setShowOverlay(show);
  };

  return (
    <OverlayContext.Provider value={{ showOverlay, toggleOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
}

export const useOverlay = () => useContext(OverlayContext);
