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
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  PieChart as PieChartIcon,
  ScatterChart,
  Sparkles,
  Table as TableIcon,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useMemo } from "react";
import { SaaSCompany, VisualizationResponse } from "../../../clients/types";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import {
  SaaSDataLoaded,
  VisualizationCreated,
  VisualizationCreating,
  VisualizationIdle,
  VisualizationUpdated,
  VisualizationUpdating,
} from "../state/SaaSVisualizationState";

interface SVGVisualizationRendererProps {
  visualization: VisualizationResponse;
  companies: SaaSCompany[];
}

const SVGVisualizationRenderer: React.FC<SVGVisualizationRendererProps> = ({
  visualization,
  companies,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const [hoverData, setHoverData] = React.useState<unknown>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const svgContent = useMemo(() => {
    if (!visualization.dataFunction || !visualization.svgFunction) {
      return null;
    }

    try {
      // Execute the data processing function
      let dataFunction: (companies: SaaSCompany[]) => unknown;
      try {
        // Try to create function directly
        dataFunction = new Function(
          "companies",
          `return (${visualization.dataFunction})(companies);`
        )();
      } catch {
        // Fallback: wrap in IIFE
        const wrappedCode = `(function() { return ${visualization.dataFunction}; })()`;
        dataFunction = eval(wrappedCode);
      }
      const processedData = dataFunction(companies);

      // Execute the SVG generation function
      let svgFunction: (processedData: unknown) => string;
      try {
        // Try to create function directly
        svgFunction = new Function(
          "processedData",
          `return (${visualization.svgFunction})(processedData);`
        )();
      } catch {
        // Fallback: wrap in IIFE
        const wrappedCode = `(function() { return ${visualization.svgFunction}; })()`;
        svgFunction = eval(wrappedCode);
      }
      const svgString = svgFunction(processedData);

      return svgString;
    } catch (error) {
      console.error("Error executing AI-generated functions:", error);
      return `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#f8fafc" rx="16"/>
        <text x="400" y="280" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#ef4444">
          Error generating visualization
        </text>
        <text x="400" y="320" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#6b7280">
          ${error instanceof Error ? error.message : "Unknown error"}
        </text>
      </svg>`;
    }
  }, [visualization.dataFunction, visualization.svgFunction, companies]);

  // Execute hover callback when hover state changes
  React.useEffect(() => {
    if (!visualization.hoverCallback || !canvasRef.current) return;

    try {
      let hoverFunction: (data: unknown) => void;
      try {
        // Try to create function directly
        hoverFunction = new Function(
          "hoverData",
          `return (${visualization.hoverCallback})(hoverData);`
        )();
      } catch {
        // Fallback: wrap in IIFE
        const wrappedCode = `(function() { return ${visualization.hoverCallback}; })()`;
        hoverFunction = eval(wrappedCode);
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const callbackData = {
        data: hoverData,
        position: mousePosition,
        canvas,
        context,
        showTooltip: isHovering,
      };

      hoverFunction(callbackData);
    } catch (error) {
      console.error("Error executing hover callback:", error);
    }
  }, [visualization.hoverCallback, isHovering, hoverData, mousePosition]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setMousePosition({ x, y });

    // Try to get data from the hovered element
    const target = event.target as SVGElement;
    if (target && target.hasAttribute("data-hover")) {
      try {
        const data = JSON.parse(target.getAttribute("data-hover") || "{}");
        setHoverData(data);
      } catch (error) {
        console.error("Error parsing hover data:", error);
        setHoverData(null);
      }
    } else {
      setHoverData(null);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverData(null);
  };

  if (!svgContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-gray-600">Unable to generate visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        className="w-full h-full flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        style={{
          display: isHovering ? "block" : "none",
          left: mousePosition.x + 10,
          top: mousePosition.y - 10,
          zIndex: 10,
        }}
      />
    </div>
  );
};

export const VisualizationDisplay: React.FC = () => {
  const { visualizationState, saasDataState } = useSaaSVisualization();

  // Get companies data from the loaded state
  const companies =
    saasDataState instanceof SaaSDataLoaded ? saasDataState.data : [];

  const getChartIcon = (type?: string) => {
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
        <Card className="w-full max-w-4xl shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <TrendingUp className="w-10 h-10 text-indigo-600" />
            </div>
            <CardTitle className="text-4xl font-bold text-gray-900 mb-4">
              Your Canvas Awaits
            </CardTitle>
            <CardDescription className="text-gray-600 text-xl leading-relaxed px-4 max-w-2xl mx-auto">
              Transform complex SaaS data into beautiful, interactive
              visualizations. Just describe what you want to see, and AI will
              create it for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Multiple Chart Types
                </h3>
                <p className="text-sm text-gray-600">
                  Bar charts, scatter plots, pie charts, and more
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-600">
                  Natural language processing creates perfect visualizations
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Interactive
                </h3>
                <p className="text-sm text-gray-600">
                  Hover for rich tooltips and detailed insights
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <Sparkles className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800 font-medium">
                  Start by entering a prompt in the panel on the left
                </span>
                <ArrowRight className="w-5 h-5 text-blue-600 ml-3" />
              </div>
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
        <Card className="shadow-2xl border-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 shadow-xl">
                  <AvatarFallback className="bg-transparent">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    {visualizationState instanceof VisualizationCreating
                      ? "Creating Your Visualization..."
                      : "Updating Visualization..."}
                  </CardTitle>
                  <CardDescription className="text-indigo-700 text-lg">
                    AI is analyzing your data and crafting the perfect
                    visualization
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-700 px-6 py-3 text-sm font-medium shadow-sm"
              >
                Processing
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Progress value={75} className="w-full h-4 mb-6 shadow-sm" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/60 rounded-xl border border-indigo-200">
                <Brain className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Analyzing Data
                </h4>
                <p className="text-sm text-gray-600">
                  Processing 100+ SaaS companies
                </p>
              </div>
              <div className="text-center p-6 bg-white/60 rounded-xl border border-purple-200">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Generating SVG
                </h4>
                <p className="text-sm text-gray-600">
                  Creating interactive elements
                </p>
              </div>
              <div className="text-center p-6 bg-white/60 rounded-xl border border-pink-200">
                <Zap className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Adding Interactivity
                </h4>
                <p className="text-sm text-gray-600">
                  Implementing hover tooltips
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-12">
            <div className="h-[500px] flex items-center justify-center">
              <div className="text-center space-y-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl text-gray-700 font-bold animate-pulse">
                    Crafting your visualization...
                  </p>
                  <p className="text-gray-500 text-lg">
                    This usually takes 10-15 seconds
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
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
                    <Badge
                      variant="outline"
                      className="capitalize px-3 py-1 text-sm font-medium"
                    >
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
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium border-gray-300"
                  >
                    Interactive
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner p-8">
                  <SVGVisualizationRenderer
                    visualization={visualization}
                    companies={companies}
                  />
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
