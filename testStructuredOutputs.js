// Test data for pie chart
const testCompaniesForPie = [
  {
    id: '1',
    name: 'SaaS Company 1',
    foundedYear: 2020,
    hq: 'San Francisco',
    industry: 'SaaS',
    totalFunding: '$10M',
    employees: '50',
    topInvestors: 'Sequoia',
    product: 'Test Product',
    g2Rating: 4.5
  },
  {
    id: '2',
    name: 'FinTech Company',
    foundedYear: 2019,
    hq: 'New York',
    industry: 'FinTech',
    totalFunding: '$25M',
    employees: '100',
    topInvestors: 'Andreessen Horowitz',
    product: 'Another Product',
    g2Rating: 4.2
  },
  {
    id: '3',
    name: 'HealthTech Company',
    foundedYear: 2021,
    hq: 'Boston',
    industry: 'HealthTech',
    totalFunding: '$15M',
    employees: '75',
    topInvestors: 'Lightspeed',
    product: 'Health Product',
    g2Rating: 4.7
  },
  {
    id: '4',
    name: 'Another SaaS Company',
    foundedYear: 2018,
    hq: 'Austin',
    industry: 'SaaS',
    totalFunding: '$30M',
    employees: '200',
    topInvestors: 'Benchmark',
    product: 'SaaS Product',
    g2Rating: 4.8
  }
];

// Mock OpenAI response for pie chart
const mockPieChartResponse = {
  raw_callback: `
    (function(companies) {
      const industryCounts = {};
      companies.forEach(c => {
        if (c.industry && c.industry !== 'N/A') {
          industryCounts[c.industry] = (industryCounts[c.industry] || 0) + 1;
        }
      });

      const sortedIndustries = Object.entries(industryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 industries

      return {
        type: "pie",
        title: "Industry Breakdown",
        data: {
          labels: sortedIndustries.map(([industry]) => industry),
          values: sortedIndustries.map(([,count]) => count),
          colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384']
        },
        config: {
          showLegend: true,
          title: "Industry Distribution"
        }
      };
    })
  `
};

// Test the pie chart function parsing
function testPieChartFunction() {
  console.log('Testing pie chart function with industry breakdown...');

  try {
    const processingFunction = eval(mockPieChartResponse.raw_callback);
    const result = processingFunction(testCompaniesForPie);

    console.log('Pie chart result:', result);
    console.log('Data type:', result.type);
    console.log('Labels:', result.data.labels);
    console.log('Values:', result.data.values);

    if (result.type === 'pie' && result.data.labels && result.data.values) {
      console.log('✅ Pie chart function test PASSED');
      console.log('Industry breakdown:', result.data.labels.map((label, i) => `${label}: ${result.data.values[i]}`));
    } else {
      console.log('❌ Pie chart function test FAILED - incorrect data structure');
    }

  } catch (error) {
    console.error('❌ Pie chart function test FAILED:', error);
  }
}

// Test data with some NaN values for scatter plot
const testCompaniesWithNaN = [
  {
    id: '1',
    name: 'Test Company 1',
    foundedYear: 2020,
    hq: 'San Francisco',
    industry: 'SaaS',
    totalFunding: '$10M',
    employees: '50',
    topInvestors: 'Sequoia',
    product: 'Test Product',
    g2Rating: 4.5
  },
  {
    id: '2',
    name: 'Test Company 2',
    foundedYear: 2019,
    hq: 'New York',
    industry: 'FinTech',
    totalFunding: '$25M', // Valid funding
    employees: '100',
    topInvestors: 'Andreessen Horowitz',
    product: 'Another Product',
    g2Rating: 4.2
  },
  {
    id: '3',
    name: 'Test Company 3',
    foundedYear: 2021,
    hq: 'Boston',
    industry: 'HealthTech',
    totalFunding: 'N/A', // This should be filtered out
    employees: '75',
    topInvestors: 'Lightspeed',
    product: 'Health Product',
    g2Rating: 4.7
  }
];

// Mock OpenAI response that might generate NaN values
const mockScatterPlotResponse = {
  raw_callback: `
    (function(companies) {
      const processed = companies.map(c => {
        let valuation = 0;
        const valStr = c.totalFunding;
        if (valStr && valStr !== 'N/A' && valStr !== 'Undisclosed') {
          if (valStr.endsWith('M')) {
            const numStr = valStr.slice(1, -1); // Remove '$' and 'M'
            valuation = parseFloat(numStr) * 1000000;
          } else if (valStr.endsWith('B')) {
            const numStr = valStr.slice(1, -1); // Remove '$' and 'B'
            valuation = parseFloat(numStr) * 1000000000;
          } else {
            const numStr = valStr.startsWith('$') ? valStr.slice(1) : valStr;
            valuation = parseFloat(numStr) || 0;
          }
          console.log('Parsed', valStr, '->', valuation);
        }

        // Only include valid data points
        if (valuation > 0 && !isNaN(valuation) && isFinite(valuation)) {
          return {
            x: c.foundedYear,
            y: valuation,
            label: c.name,
            metadata: { industry: c.industry }
          };
        }
        return null;
      }).filter(point => point !== null); // Remove null entries

      return {
        type: "scatter",
        title: "Company Funding vs Founding Year",
        data: { points: processed },
        config: {
          xAxisLabel: "Founded Year",
          yAxisLabel: "Funding ($)",
          showGrid: true
        }
      };
    })
  `
};

// Test the scatter plot function parsing
function testScatterPlotFunction() {
  console.log('Testing scatter plot function with potential NaN values...');

  try {
    const processingFunction = eval(mockScatterPlotResponse.raw_callback);

    console.log('Test data:', testCompaniesWithNaN);
    console.log('Processing function created');

    const result = processingFunction(testCompaniesWithNaN);
    console.log('Function execution result:', result);
    console.log('Number of points:', result.data.points.length);

    // Debug: check what each company produces
    testCompaniesWithNaN.forEach((company, index) => {
      console.log(`Company ${index + 1} (${company.name}): funding = ${company.totalFunding}`);
    });

    // Check that invalid data was filtered out
    const validPoints = result.data.points.filter(p => !isNaN(p.y) && isFinite(p.y));
    console.log('Valid points after filtering:', validPoints.length);

    if (result.data.points.length > 0 && validPoints.length === result.data.points.length) {
      console.log('✅ Scatter plot function test PASSED - all points are valid');
    } else if (result.data.points.length === 0) {
      console.log('⚠️  Scatter plot function test - no valid data found (this may be expected if data is invalid)');
    } else {
      console.log('⚠️  Scatter plot function test - some invalid data was filtered');
    }

  } catch (error) {
    console.error('❌ Scatter plot function test FAILED:', error);
  }
}

// Mock OpenAI response with structured output (function body only)
const mockOpenAIResponse = {
  raw_callback: `
    (function(companies) {
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
    })
  `
};

// Test the function parsing directly
function testFunctionExecution() {
  console.log('Testing function execution from structured output...');

  try {
    // Extract function code from mock response
    const functionCode = mockOpenAIResponse.raw_callback;

    // Create the processing function using eval (simpler approach)
    console.log('Creating function with code:', functionCode);
    const processingFunction = eval(functionCode);
    console.log('Processing function created:', typeof processingFunction);

    // Execute with test data
    console.log('Executing with test data:', testCompaniesForPie);
    const result = processingFunction(testCompaniesForPie);
    console.log('Function execution result:', result);

    // Validate result structure
    if (result && typeof result === 'object' && result.type && result.title && result.data) {
      console.log('✅ Function parsing test PASSED');
      console.log('Result type:', result.type);
      console.log('Result title:', result.title);
      console.log('Result data keys:', Object.keys(result.data));
    } else {
      console.log('❌ Function parsing test FAILED - invalid result structure');
    }

  } catch (error) {
    console.error('❌ Function parsing test FAILED:', error);
  }
}

// Run the tests
testFunctionExecution();
testScatterPlotFunction();
testPieChartFunction();