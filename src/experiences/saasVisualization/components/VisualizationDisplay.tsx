import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  PieChart as PieChartIcon,
  ScatterChart,
  Table as TableIcon,
  TrendingUp,
} from "lucide-react";
import React from "react";
import {
  BarChartData,
  PieChartData,
  ScatterPlotData,
  TableData,
} from "../../../clients/types";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import {
  VisualizationCreated,
  VisualizationCreating,
  VisualizationIdle,
  VisualizationUpdated,
  VisualizationUpdating,
} from "../state/SaaSVisualizationState";
import { BarChart } from "./charts/BarChart";
import { ChartSkeleton } from "./charts/ChartSkeletons";
import { PieChart } from "./charts/PieChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { Table } from "./charts/Table";

export const VisualizationDisplay: React.FC = () => {
  const { visualizationState } = useSaaSVisualization();

  const getChartIcon = (type: string) => {
    switch (type) {
      case "pie":
        return <PieChartIcon className="w-5 h-5" />;
      case "bar":
        return <BarChart3 className="w-5 h-5" />;
      case "scatter":
        return <ScatterChart className="w-5 h-5" />;
      case "table":
        return <TableIcon className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  if (visualizationState instanceof VisualizationIdle) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Ready to Visualize
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Enter a prompt above to create your first data visualization
              powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    visualizationState instanceof VisualizationCreating ||
    visualizationState instanceof VisualizationUpdating
  ) {
    return (
      <div className="min-h-[600px] flex flex-col">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600">
                  <AvatarFallback className="bg-transparent">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {visualizationState instanceof VisualizationCreating
                      ? "Creating Visualization..."
                      : "Updating Visualization..."}
                  </CardTitle>
                  <CardDescription className="text-indigo-600">
                    AI is processing your request and generating insights
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-700"
              >
                Processing
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">
              Analyzing data patterns...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <ChartSkeleton type="pie" />
                <p className="text-gray-500 mt-4 animate-pulse">
                  Generating visualization...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    visualizationState instanceof VisualizationCreated ||
    visualizationState instanceof VisualizationUpdated
  ) {
    const visualization = visualizationState.visualization;

    return (
      <div className="min-h-[600px] space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600">
                  <AvatarFallback className="bg-transparent">
                    {getChartIcon(visualization.type)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {visualization.title}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(visualization.createdAt).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {visualization.type} Chart
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Horizontal Layout: AI Insights + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights Sidebar */}
          {(visualization.methodology ||
            visualization.rationale ||
            visualization.error) && (
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visualization.methodology && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">
                            Analysis Method
                          </h5>
                          <p className="text-sm text-blue-800 leading-relaxed">
                            {visualization.methodology}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {visualization.rationale && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-green-900 mb-2">
                            Why This Chart
                          </h5>
                          <p className="text-sm text-green-800 leading-relaxed">
                            {visualization.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {visualization.error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-red-900 mb-2">
                            Request Issue
                          </h5>
                          <p className="text-sm text-red-800 leading-relaxed">
                            {visualization.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart Section */}
          <div
            className={`${
              visualization.methodology ||
              visualization.rationale ||
              visualization.error
                ? "lg:col-span-2"
                : "lg:col-span-3"
            }`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    {getChartIcon(visualization.type)}
                    <span className="ml-2 capitalize">
                      {visualization.type} Visualization
                    </span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Interactive
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden p-4">
                  {visualization.type === "pie" && (
                    <PieChart
                      data={visualization.data as PieChartData}
                      config={visualization.config}
                    />
                  )}
                  {visualization.type === "scatter" && (
                    <ScatterPlot
                      data={visualization.data as ScatterPlotData}
                      config={visualization.config}
                    />
                  )}
                  {visualization.type === "bar" && (
                    <BarChart
                      data={visualization.data as BarChartData}
                      config={visualization.config}
                    />
                  )}
                  {visualization.type === "table" && (
                    <Table
                      data={visualization.data as TableData}
                      config={visualization.config}
                    />
                  )}
                  {visualization.type === "line" && (
                    <BarChart
                      data={visualization.data as BarChartData}
                      config={visualization.config}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
