import "./App.css";
import { clients } from "./config";
import { SaaSVisualizationProvider } from "./experiences/saasVisualization/SaaSVisualizationContext";
import { SaaSVisualizationContainer } from "./experiences/saasVisualization/components/SaaSVisualizationContainer";

function App() {
  return (
    <SaaSVisualizationProvider saasClient={clients.saasVisualization}>
      <div className="min-h-screen bg-gray-50">
        <SaaSVisualizationContainer />
      </div>
    </SaaSVisualizationProvider>
  );
}

export default App;
