# Marketing Campaign Calculator

A comprehensive tool for planning, tracking, and reporting on marketing campaigns across regions.

## Features

- **Campaign Planning**: Create and manage marketing campaigns with detailed information
- **Budget Management**: Assign and track budgets by region with warnings for overruns
- **Execution Tracking**: Monitor campaign status, costs, and performance metrics
- **Performance Metrics**: Automatically calculate MQLs, SQLs, opportunities, and pipeline forecasts
- **Reporting Dashboard**: Visual analytics with filters for region, country, and quarter
- **Data Import/Export**: CSV import/export functionality
- **Persistence**: Save data to GitHub repository or local storage

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Shadcn UI components
- Phosphor icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

The application is organized into tabs for different functionalities:

### Planning Tab

- Create and manage marketing campaigns in a table format
- Enter campaign details including type, strategic pillars, revenue play, etc.
- View calculated metrics (MQLs, SQLs, opportunities, pipeline)

### Execution Tracking Tab

- Update campaign status and performance metrics
- Track actual costs versus forecasted costs
- Monitor campaign progress with status indicators

### Budget Management Tab

- Assign budgets to different regions
- View budget utilization with progress bars
- Get warnings when forecasted or actual costs exceed budgets

### GitHub Sync Tab

- Save campaign data to a GitHub repository
- Load campaign data from a GitHub repository
- Configure GitHub repository details
- Export the entire application as a downloadable ZIP file

### Reporting Tab

- View campaign performance across regions
- Filter reports by region, country, and quarter
- Visualize data with charts and graphs

## Data Model

The application uses the following data structure:

### Campaign

- Campaign Type (dropdown)
- Strategic Pillar (multi-select)
- Revenue Play (dropdown)
- FY (dropdown)
- Quarter / Month (dropdown)
- Region (dropdown)
- Country (dropdown)
- Owner (dropdown)
- Description (text)
- Forecasted Cost (number)
- Expected Leads (number)
- MQLs (calculated)
- SQLs (calculated)
- Opportunities (calculated)
- Pipeline Forecast (calculated)
- Status (dropdown)
- PO Raised (yes/no)
- Salesforce Campaign Code (text)
- Issue Link (URL)
- Actual Cost (number)
- Actual Leads (number)
- Actual MQLs (number)

### Regional Budget

- Region (JP & Korea, South APAC, SAARC, Digital Motions, X APAC English, X APAC Non English)
- Assigned Budget (number)
- Programs (array of program allocations)
- Lock Status (boolean)

## License

This project is licensed under the MIT License.

## Acknowledgements

- Shadcn UI for the component library
- Phosphor Icons for the icon set
- Recharts for the charting library