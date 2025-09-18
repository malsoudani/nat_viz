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
      <div className="min-h-[600px] flex items-center justify-center p-12">
        <Card className="w-full max-w-3xl shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <TrendingUp className="w-10 h-10 text-indigo-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Visualize
            </CardTitle>
            <CardDescription className="text-gray-600 text-xl leading-relaxed px-4">
              Enter a prompt above to create your first data visualization
              powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-3">
              <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
              <div
                className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"
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
      <div className="min-h-[600px] flex flex-col space-y-8 px-6 py-8">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <AvatarFallback className="bg-transparent">
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {visualizationState instanceof VisualizationCreating
                      ? "Creating Visualization..."
                      : "Updating Visualization..."}
                  </CardTitle>
                  <CardDescription className="text-indigo-700 text-lg">
                    AI is processing your request and generating insights
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium"
              >
                Processing
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Progress value={75} className="w-full h-3 mb-4" />
            <p className="text-base text-gray-600 font-medium">
              Analyzing data patterns and generating visualization...
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardContent className="p-12">
            <div className="h-[500px] flex items-center justify-center">
              <div className="text-center space-y-6">
                <ChartSkeleton type="pie" />
                <div className="space-y-2">
                  <p className="text-xl text-gray-700 font-medium animate-pulse">
                    Generating visualization...
                  </p>
                  <p className="text-gray-500 text-base">
                    This may take a few moments
                  </p>
                </div>
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
      <div className="min-h-[600px] space-y-8 px-6 py-8">
        {/* Header Card */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <AvatarFallback className="bg-transparent">
                    {getChartIcon(visualization.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    {visualization.title}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-6 text-base text-gray-600">
                    <span className="flex items-center font-medium">
                      <Clock className="w-5 h-5 mr-2" />
                      {new Date(visualization.createdAt).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="capitalize px-3 py-1 text-sm font-medium">
                      {visualization.type} Chart
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 px-4 py-2 text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ready
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Horizontal Layout: AI Insights + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights Sidebar */}
          {(visualization.methodology ||
            visualization.rationale ||
            visualization.error) && (
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-gray-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                    <Brain className="w-6 h-6 mr-3 text-indigo-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {visualization.methodology && (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h5 className="text-base font-semibold text-blue-900">
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
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h5 className="text-base font-semibold text-green-900">
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
                    <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h5 className="text-base font-semibold text-red-900">
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
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-900">
                  <span className="flex items-center">
                    {getChartIcon(visualization.type)}
                    <span className="ml-3 capitalize text-xl">
                      {visualization.type} Visualization
                    </span>
                  </span>
                  <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-gray-300">
                    Interactive
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner p-8">
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
