import "./App.css";
import { clients } from "./config";
import { SaaSVisualizationProvider } from "./experiences/saasVisualization/SaaSVisualizationContext";
import { SaaSVisualizationContainer } from "./experiences/saasVisualization/components/SaaSVisualizationContainer";

function App() {
  return (
    <SaaSVisualizationProvider saasClient={clients.saasVisualization}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <SaaSVisualizationContainer />
      </div>
    </SaaSVisualizationProvider>
  );
}

export default App;
