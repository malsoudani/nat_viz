import { SaaSCompany, VisualizationResponse } from "../../../clients/types";

export class SaaSVisualizationState {}

export class SaaSDataState extends SaaSVisualizationState {}

export class SaaSDataLoading extends SaaSDataState {}
export class SaaSDataLoaded extends SaaSDataState {
  constructor(public data: SaaSCompany[]) {
    super();
  }
}
export class SaaSDataError extends SaaSDataState {
  constructor(public message: string) {
    super();
  }
}

export class VisualizationState extends SaaSVisualizationState {}

export class VisualizationIdle extends VisualizationState {}
export class VisualizationCreating extends VisualizationState {}
export class VisualizationCreated extends VisualizationState {
  constructor(public visualization: VisualizationResponse) {
    super();
  }
}
export class VisualizationCreateError extends VisualizationState {
  constructor(public message: string) {
    super();
  }
}

export class VisualizationUpdating extends VisualizationState {}
export class VisualizationUpdated extends VisualizationState {
  constructor(public visualization: VisualizationResponse) {
    super();
  }
}
export class VisualizationUpdateError extends VisualizationState {
  constructor(public message: string) {
    super();
  }
}

export class VisualizationsLoading extends VisualizationState {}
export class VisualizationsLoaded extends VisualizationState {
  constructor(public visualizations: VisualizationResponse[]) {
    super();
  }
}
export class VisualizationsError extends VisualizationState {
  constructor(public message: string) {
    super();
  }
}
