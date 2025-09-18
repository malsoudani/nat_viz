# SaaS Data Visualization App

A modern React application that creates interactive visualizations from **real SaaS company data** using natural language prompts powered by OpenAI.

## 🚀 Features

- 🤖 **AI-Powered Visualizations**: Create charts and graphs using natural language prompts
- 📊 **Multiple Chart Types**: Support for pie charts, scatter plots, bar charts, and data tables
- 💾 **Real Dataset**: Uses actual data from Top 100 SaaS Companies 2025
- 💰 **Financial Data**: ARR, valuation, funding, and employee metrics
- ⭐ **G2 Ratings**: Customer satisfaction ratings for analysis
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Development**: Built with Vite + TypeScript + SWC

## � Dataset

The app uses real data from `top_100_saas_companies_2025.csv` containing:

- **Company Information**: Name, founding year, headquarters, industry
- **Financial Metrics**: Total funding, ARR, valuation (with currency formatting)
- **Operational Data**: Employee count, top investors, product details
- **Customer Insights**: G2 ratings for product quality assessment

### Sample Data Fields:
- Microsoft, Oracle, Salesforce, Adobe, SAP
- Financial data in formats: $270B, $52.9B, $1.5M
- Industries: Enterprise Software, CRM, Database, Creative Software
- G2 Ratings: 4.4, 4.3, 4.5, etc.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite with SWC
- **Styling**: Tailwind CSS
- **AI**: OpenAI API
- **State Management**: React Context + Custom Hooks
- **Functional Programming**: fp-ts for error handling
- **Package Manager**: Yarn

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+ (recommended)
- Yarn package manager
- OpenAI API key

## 🔧 Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nat_viz
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env and add your OpenAI API key
   # VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file

## 🚀 Running the App

### Development
```bash
yarn dev
```

### Production Build
```bash
yarn build
yarn preview
```

## 🎯 Usage

1. **Enter a natural language prompt** in the input field, such as:
   - "Create a pie chart showing SaaS companies by industry"
   - "Show me a bar chart of top 10 companies by ARR"
   - "Display a scatter plot of valuation vs G2 rating"
   - "Create a table of companies founded after 2020"
   - "Show funding amounts by industry"

2. **View your visualization** in the display area
3. **Manage multiple visualizations** using the list below

### 💡 Example Prompts:
- **Industry Analysis**: "Pie chart of company distribution by industry"
- **Financial Insights**: "Bar chart of top 10 companies by valuation"
- **Performance Metrics**: "Scatter plot of ARR vs G2 rating"
- **Geographic Data**: "Companies grouped by headquarters location"
- **Growth Analysis**: "Companies founded in the last 5 years"

## 📁 Project Structure

```
src/
├── clients/                 # API clients and data types
├── experiences/
│   └── saasVisualization/   # Main visualization experience
│       ├── components/      # React components
│       ├── state/          # State management
│       └── SaaSVisualizationContext.tsx
├── config.ts               # App configuration
└── App.tsx                 # Main app component
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `VITE_OPENAI_API_BASE_URL` | Custom OpenAI API endpoint | No |
| `VITE_OPENAI_MODEL` | OpenAI model to use (default: gpt-4) | No |
| `VITE_API_URL` | External API URL for additional services | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
