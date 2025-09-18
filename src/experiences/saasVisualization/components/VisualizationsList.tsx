import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Clock,
  Database,
  Eye,
  PieChart,
  ScatterChart,
  Sparkles,
  Table,
  Trash2,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import { DeleteVisualizationRequested } from "../state/SaaSVisualizationEvent";
import { VisualizationsLoaded } from "../state/SaaSVisualizationState";

export const VisualizationsList: React.FC = () => {
  const { visualizationsState, emitEvent } = useSaaSVisualization();

  if (!(visualizationsState instanceof VisualizationsLoaded)) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center text-xl font-bold text-gray-900">
            <Database className="w-6 h-6 mr-3 text-blue-600" />
            Your Visualizations
          </CardTitle>
          <CardDescription className="text-gray-600">
            Loading your saved visualizations...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 text-lg">Loading visualizations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { visualizations } = visualizationsState;

  const getChartIcon = (type?: string) => {
    switch (type) {
      case "pie":
        return <PieChart className="w-5 h-5" />;
      case "bar":
        return <BarChart3 className="w-5 h-5" />;
      case "scatter":
        return <ScatterChart className="w-5 h-5" />;
      case "table":
        return <Table className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getChartColor = (type?: string) => {
    switch (type) {
      case "pie":
        return "from-blue-500 to-blue-600";
      case "bar":
        return "from-green-500 to-green-600";
      case "scatter":
        return "from-purple-500 to-purple-600";
      case "table":
        return "from-orange-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
              <Database className="w-6 h-6 mr-3 text-blue-600" />
              Your Visualizations
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              {visualizations.length} visualization
              {visualizations.length !== 1 ? "s" : ""} created
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Generated
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {visualizations.length === 0 ? (
          <div className="text-center py-16 px-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No visualizations yet
            </h3>
            <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
              Create your first visualization by entering a prompt in the panel
              above. AI will transform your ideas into beautiful, interactive
              charts.
            </p>
            <div className="flex justify-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visualizations.map((visualization) => (
              <Card
                key={visualization.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-white to-gray-50/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${getChartColor(
                          visualization.type
                        )} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <div className="text-white">
                          {getChartIcon(visualization.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg truncate">
                            {visualization.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs font-medium border-gray-300 text-gray-700"
                          >
                            {visualization.type}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(
                              visualization.createdAt
                            ).toLocaleDateString()}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                          >
                            Ready
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          Interactive {visualization.type} chart created with AI
                          assistance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                        onClick={() =>
                          emitEvent(
                            new DeleteVisualizationRequested(visualization.id)
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
