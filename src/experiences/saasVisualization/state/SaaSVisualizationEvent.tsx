export class SaaSVisualizationEvent {}

export class LoadSaaSDataRequested extends SaaSVisualizationEvent {}

export class CreateVisualizationRequested extends SaaSVisualizationEvent {
  constructor(public prompt: string) {
    super();
  }
}

export class UpdateVisualizationRequested extends SaaSVisualizationEvent {
  constructor(public id: string, public prompt: string) {
    super();
  }
}

export class DeleteVisualizationRequested extends SaaSVisualizationEvent {
  constructor(public id: string) {
    super();
  }
}

export class LoadVisualizationsRequested extends SaaSVisualizationEvent {}
