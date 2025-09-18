import { SaaSVisualizationClient } from "./clients/saasVisualization";

export const API_URL = import.meta.env.VITE_API_URL;

export const clients = {
  saasVisualization: new SaaSVisualizationClient(),
  // Add new clients here as needed
};
