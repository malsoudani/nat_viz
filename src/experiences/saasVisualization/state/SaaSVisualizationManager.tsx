import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { useCallback, useEffect, useRef, useState } from "react";
import { HttpError } from "../../../clients/httpClient";
import { ISaaSVisualizationClient } from "../../../clients/interfaces";
import { SaaSCompany, VisualizationResponse } from "../../../clients/types";
import {
  CreateVisualizationRequested,
  DeleteVisualizationRequested,
  LoadSaaSDataRequested,
  LoadVisualizationsRequested,
  SaaSVisualizationEvent,
  UpdateVisualizationRequested,
} from "./SaaSVisualizationEvent";
import {
  SaaSDataError,
  SaaSDataLoaded,
  SaaSDataLoading,
  SaaSDataState,
  SaaSVisualizationState,
  VisualizationCreateError,
  VisualizationCreated,
  VisualizationCreating,
  VisualizationIdle,
  VisualizationState,
  VisualizationUpdateError,
  VisualizationUpdated,
  VisualizationUpdating,
  VisualizationsError,
  VisualizationsLoaded,
  VisualizationsLoading,
} from "./SaaSVisualizationState";

export interface SaaSVisualizationManager {
  saasDataState: SaaSDataState;
  visualizationState: VisualizationState;
  visualizationsState: SaaSVisualizationState;
  loadSaaSData: () => Promise<void>;
  loadVisualizations: () => Promise<void>;
  createVisualization: (prompt: string, data: SaaSCompany[]) => Promise<void>;
  updateVisualization: (id: string, prompt: string) => Promise<void>;
  deleteVisualization: (id: string) => Promise<void>;
  emitEvent: (event: SaaSVisualizationEvent) => void;
}

export const useSaaSVisualizationManager = (
  saasSvc: ISaaSVisualizationClient
): SaaSVisualizationManager => {
  const [saasDataState, setSaasDataState] = useState<SaaSDataState>(
    new SaaSDataLoading()
  );
  const [visualizationState, setVisualizationState] =
    useState<VisualizationState>(new VisualizationIdle());
  const [visualizationsState, setVisualizationsState] =
    useState<SaaSVisualizationState>(new VisualizationsLoading());

  // Use ref to track current saasDataState without causing re-renders
  const saasDataStateRef = useRef<SaaSDataState>(saasDataState);

  // Keep ref in sync with state
  useEffect(() => {
    saasDataStateRef.current = saasDataState;
  }, [saasDataState]);

  const onError = useCallback((error: HttpError) => {
    console.error("SaaS Visualization Error:", error);
  }, []);

  const loadVisualizations = useCallback(async () => {
    setVisualizationsState(new VisualizationsLoading());

    await pipe(
      saasSvc.getVisualizations(),
      TE.match(
        (err: HttpError) => {
          onError(err);
          setVisualizationsState(
            new VisualizationsError(
              err.message || "Failed to load visualizations"
            )
          );
        },
        (visualizations: VisualizationResponse[]) => {
          setVisualizationsState(new VisualizationsLoaded(visualizations));
        }
      )
    )();
  }, [saasSvc, onError]);

  const loadSaaSData = useCallback(async () => {
    setSaasDataState(new SaaSDataLoading());

    await pipe(
      saasSvc.getSaaSData(),
      TE.match(
        (err: HttpError) => {
          onError(err);
          setSaasDataState(
            new SaaSDataError(err.message || "Failed to load SaaS data")
          );
        },
        (data: SaaSCompany[]) => {
          setSaasDataState(new SaaSDataLoaded(data));
        }
      )
    )();
  }, [saasSvc, onError]);

  const createVisualization = useCallback(
    async (prompt: string, data: SaaSCompany[]) => {
      setVisualizationState(new VisualizationCreating());

      await pipe(
        saasSvc.createVisualization({ prompt, data }),
        TE.match(
          (err: HttpError) => {
            onError(err);
            setVisualizationState(
              new VisualizationCreateError(
                err.message || "Failed to create visualization"
              )
            );
          },
          (visualization: VisualizationResponse) => {
            setVisualizationState(new VisualizationCreated(visualization));
            // Refresh visualizations list
            loadVisualizations();
          }
        )
      )();
    },
    [saasSvc, onError, loadVisualizations]
  );

  const updateVisualization = useCallback(
    async (id: string, prompt: string) => {
      setVisualizationState(new VisualizationUpdating());

      await pipe(
        saasSvc.updateVisualization({ id, prompt, currentConfig: {} }),
        TE.match(
          (err: HttpError) => {
            onError(err);
            setVisualizationState(
              new VisualizationUpdateError(
                err.message || "Failed to update visualization"
              )
            );
          },
          (visualization: VisualizationResponse) => {
            setVisualizationState(new VisualizationUpdated(visualization));
            // Refresh visualizations list
            loadVisualizations();
          }
        )
      )();
    },
    [saasSvc, onError, loadVisualizations]
  );

  const deleteVisualization = useCallback(
    async (id: string) => {
      await pipe(
        saasSvc.deleteVisualization(id),
        TE.match(
          (err: HttpError) => {
            onError(err);
            // Could add a delete error state if needed
          },
          () => {
            // Refresh visualizations list
            loadVisualizations();
          }
        )
      )();
    },
    [saasSvc, onError, loadVisualizations]
  );

  const emitEvent = useCallback(
    (event: SaaSVisualizationEvent) => {
      switch (event.constructor) {
        case LoadSaaSDataRequested: {
          loadSaaSData();
          break;
        }
        case LoadVisualizationsRequested: {
          loadVisualizations();
          break;
        }
        case CreateVisualizationRequested: {
          const createEvent = event as CreateVisualizationRequested;
          loadSaaSData().then(() => {
            // Use ref to get current state without dependency issues
            if (saasDataStateRef.current instanceof SaaSDataLoaded) {
              createVisualization(
                createEvent.prompt,
                saasDataStateRef.current.data
              );
            }
          });
          break;
        }
        case UpdateVisualizationRequested: {
          const updateEvent = event as UpdateVisualizationRequested;
          updateVisualization(updateEvent.id, updateEvent.prompt);
          break;
        }
        case DeleteVisualizationRequested: {
          const deleteEvent = event as DeleteVisualizationRequested;
          deleteVisualization(deleteEvent.id);
          break;
        }
        default:
          break;
      }
    },
    [
      loadSaaSData,
      loadVisualizations,
      createVisualization,
      updateVisualization,
      deleteVisualization,
    ]
  );

  return {
    saasDataState,
    visualizationState,
    visualizationsState,
    loadSaaSData,
    loadVisualizations,
    createVisualization,
    updateVisualization,
    deleteVisualization,
    emitEvent,
  };
};
