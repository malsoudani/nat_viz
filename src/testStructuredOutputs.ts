// Test data
const testCompanies = [
  {
    id: "1",
    name: "Test Company",
    foundedYear: 2020,
    hq: "San Francisco",
    industry: "SaaS",
    totalFunding: "$10M",
    employees: "50",
    topInvestors: "Sequoia",
    product: "Test Product",
    g2Rating: 4.5,
  },
];

// Mock OpenAI response with structured output
const mockOpenAIResponse = {
  raw_callback: `
    function(companies) {
      const industryCounts = {};
      companies.forEach(company => {
        const industry = company.industry;
        industryCounts[industry] = (industryCounts[industry] || 0) + 1;
      });

      return {
        type: 'pie',
        title: 'Industry Distribution',
        data: {
          labels: Object.keys(industryCounts),
          values: Object.values(industryCounts),
          colors: ['#FF6384', '#36A2EB', '#FFCE56']
        },
        config: {
          showLegend: true,
          title: 'Industry Distribution'
        }
      };
    }
  `,
};

// Test the function parsing directly
function testFunctionExecution() {
  console.log("Testing function execution from structured output...");

  try {
    // Extract function code from mock response
    const functionCode = mockOpenAIResponse.raw_callback;

    // Create the processing function (same logic as in saasVisualization.ts)
    const processingFunction = new Function(
      "companies",
      `return (${functionCode})(companies);`
    )();

    // Execute with test data
    const result = processingFunction(testCompanies);
    console.log("Function execution result:", result);

    // Validate result structure
    if (
      result &&
      typeof result === "object" &&
      result.type &&
      result.title &&
      result.data
    ) {
      console.log("✅ Function parsing test PASSED");
      console.log("Result type:", result.type);
      console.log("Result title:", result.title);
      console.log("Result data keys:", Object.keys(result.data));
    } else {
      console.log("❌ Function parsing test FAILED - invalid result structure");
    }
  } catch (error) {
    console.error("❌ Function parsing test FAILED:", error);
  }
}

// Run the test
testFunctionExecution();
