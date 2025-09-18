import React, { createContext, ReactNode, useContext } from "react";
import { ISaaSVisualizationClient } from "../../clients/interfaces";
import { SaaSVisualizationEvent } from "./state/SaaSVisualizationEvent";
import {
  SaaSVisualizationManager,
  useSaaSVisualizationManager,
} from "./state/SaaSVisualizationManager";

interface SaaSVisualizationContextType extends SaaSVisualizationManager {
  emitEvent: (event: SaaSVisualizationEvent) => void;
}

const SaaSVisualizationContext = createContext<
  SaaSVisualizationContextType | undefined
>(undefined);

interface SaaSVisualizationProviderProps {
  children: ReactNode;
  saasClient: ISaaSVisualizationClient;
}

export const SaaSVisualizationProvider: React.FC<
  SaaSVisualizationProviderProps
> = ({ children, saasClient }) => {
  const manager = useSaaSVisualizationManager(saasClient);

  const contextValue: SaaSVisualizationContextType = {
    ...manager,
  };

  return (
    <SaaSVisualizationContext.Provider value={contextValue}>
      {children}
    </SaaSVisualizationContext.Provider>
  );
};

export const useSaaSVisualization = (): SaaSVisualizationContextType => {
  const context = useContext(SaaSVisualizationContext);
  if (context === undefined) {
    throw new Error(
      "useSaaSVisualization must be used within a SaaSVisualizationProvider"
    );
  }
  return context;
};
