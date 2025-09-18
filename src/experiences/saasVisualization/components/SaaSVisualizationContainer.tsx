import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Database, Sparkles, TrendingUp, Zap } from "lucide-react";
import React, { useEffect } from "react";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import {
  LoadSaaSDataRequested,
  LoadVisualizationsRequested,
} from "../state/SaaSVisualizationEvent";
import {
  SaaSDataLoaded,
  VisualizationsLoaded,
} from "../state/SaaSVisualizationState";
import { PromptInput } from "./PromptInput";
import { VisualizationDisplay } from "./VisualizationDisplay";
import { VisualizationsList } from "./VisualizationsList";

export const SaaSVisualizationContainer: React.FC = () => {
  const { saasDataState, visualizationsState, emitEvent } =
    useSaaSVisualization();

  // Load initial data on mount
  useEffect(() => {
    emitEvent(new LoadSaaSDataRequested());
    emitEvent(new LoadVisualizationsRequested());
  }, [emitEvent]); // Include emitEvent in dependency array

  const features = [
    {
      icon: Brain,
      title: "AI-Powered",
      description:
        "Natural language prompts create stunning visualizations instantly",
    },
    {
      icon: Zap,
      title: "Interactive",
      description: "Hover over data points for rich canvas-rendered tooltips",
    },
    {
      icon: Database,
      title: "100+ Companies",
      description: "Comprehensive SaaS market data from top companies",
    },
    {
      icon: Sparkles,
      title: "Self-Sufficient",
      description: "AI generates complete, standalone visualization functions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Data Visualization
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform SaaS Data into
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Stunning Visualizations
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Describe what you want to see in plain English, and our AI will
              create interactive, professional-grade visualizations from
              comprehensive SaaS market data.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Prompt Input - Single Column */}
        <div className="mb-8">
          <PromptInput />
        </div>

        {/* Two Column Layout for Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Data Status Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-bold text-gray-900">
                <Database className="w-5 h-5 mr-3 text-blue-600" />
                Data Status
              </CardTitle>
              <CardDescription className="text-gray-600">
                Real-time status of your visualization data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      saasDataState instanceof SaaSDataLoaded
                        ? "bg-green-500"
                        : "bg-yellow-500 animate-pulse"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    SaaS Companies
                  </span>
                </div>
                <Badge
                  variant={
                    saasDataState instanceof SaaSDataLoaded
                      ? "default"
                      : "secondary"
                  }
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  {saasDataState instanceof SaaSDataLoaded
                    ? `${saasDataState.data.length} loaded`
                    : "Loading..."}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      visualizationsState instanceof VisualizationsLoaded
                        ? "bg-blue-500"
                        : "bg-yellow-500 animate-pulse"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    Visualizations
                  </span>
                </div>
                <Badge
                  variant={
                    visualizationsState instanceof VisualizationsLoaded
                      ? "default"
                      : "secondary"
                  }
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                >
                  {visualizationsState instanceof VisualizationsLoaded
                    ? `${visualizationsState.visualizations.length} created`
                    : "Loading..."}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-bold text-gray-900">
                <TrendingUp className="w-5 h-5 mr-3 text-indigo-600" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    100+
                  </div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    15+
                  </div>
                  <div className="text-sm text-gray-600">Industries</div>
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  AI-Powered
                </div>
                <div className="text-sm text-gray-600">
                  Interactive Visualizations
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Display - Single Column */}
        <div className="mb-8">
          <VisualizationDisplay />
        </div>

        {/* Visualizations List - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VisualizationsList />
        </div>
      </div>
    </div>
  );
};
