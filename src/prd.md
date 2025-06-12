# Marketing Campaign Calculator PRD

## Core Purpose & Success
- **Mission Statement**: A real-time calculator for marketing teams to forecast campaign performance metrics and financial outcomes, with execution tracking and data-driven reporting.
- **Success Indicators**: Accurate calculations, intuitive form inputs, clear visualization of results, effective tracking of campaign execution, and comprehensive reporting dashboards.
- **Experience Qualities**: Efficient, Professional, Responsive

## Project Classification & Approach
- **Complexity Level**: Light Application (form with real-time calculations, status tracking, and reporting)
- **Primary User Activity**: Creating, Tracking, and Analyzing (inputting data, updating status, and reviewing performance)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Marketing teams need to quickly estimate campaign performance metrics, track execution status, and analyze aggregate data across regions and time periods.
- **User Context**: Users will engage with this tool during campaign planning, budget meetings, execution reviews, and quarterly performance reporting.
- **Critical Path**: Select region → Assign budget → Select campaign parameters → Input forecasted values → View calculated metrics → Update execution status → Monitor budget utilization → Generate reports
- **Key Moments**: 
  1. Selecting all required campaign parameters
  2. Viewing the real-time calculation of derived metrics
  3. Seeing the financial impact (pipeline value)
  4. Updating campaign execution status and details
  5. Analyzing filtered data across multiple campaigns

## Essential Features
1. **Input Form**
   - What: Form with text input, dropdown, multi-select, and numeric inputs
   - Why: Capture necessary campaign parameters including campaign owner
   - Success: All inputs function properly with appropriate validation

2. **Live Calculations**
   - What: Real-time calculation of MQLs, SQLs, Opportunities, and Pipeline value
   - Why: Provide immediate feedback on campaign potential
   - Success: Calculations update instantly and accurately

3. **Clean Visual Display**
   - What: Clear presentation of inputs and calculated results
   - Why: Enable quick understanding of the forecast
   - Success: Users can easily distinguish between inputs and calculated values

4. **Execution Tracking**
   - What: Fields to track campaign status, PO status, campaign codes, issue links, and actual costs with visualization
   - Why: Enable teams to monitor campaign progress and compare actual vs. forecasted performance
   - Success: Users can effectively update campaign status and visualize cost comparisons throughout its lifecycle

5. **Budget Management**
   - What: Regional budget tracking and comparison against forecasted and actual costs
   - Why: Enable financial oversight and budget adherence across regions
   - Success: Clear visual indicators when budgets are exceeded with appropriate alerts

6. **Reporting Dashboard**
   - What: Filterable dashboard with visualizations and summary metrics across campaigns
   - Why: Enable analysis of aggregated campaign data for better decision making
   - Success: Users can filter data by region, country, and quarter to gain actionable insights

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Confidence, clarity, professionalism
- **Design Personality**: Professional, clean, organized
- **Visual Metaphors**: Dashboard, calculator, progress tracker
- **Simplicity Spectrum**: Minimal interface to focus on the data

### Color Strategy
- **Color Scheme Type**: Monochromatic with accent
- **Primary Color**: Deep blue (#1a365d) - represents trust and professionalism
- **Secondary Colors**: Lighter blues for supporting elements
- **Accent Color**: Teal (#0d9488) for highlighting important metrics and CTAs
- **Status Colors**: Green for "Shipped", Yellow for "On Track", Blue for "Planning", Red for "Cancelled"
- **Color Psychology**: Blues convey trust and reliability in financial contexts
- **Color Accessibility**: High contrast between text and backgrounds
- **Foreground/Background Pairings**:
  - Background (#f8fafc) / Foreground (#1e293b)
  - Card (#ffffff) / Card-foreground (#0f172a)
  - Primary (#1a365d) / Primary-foreground (#ffffff)
  - Secondary (#94a3b8) / Secondary-foreground (#ffffff)
  - Accent (#0d9488) / Accent-foreground (#ffffff)
  - Muted (#f1f5f9) / Muted-foreground (#64748b)

### Typography System
- **Font Pairing Strategy**: Single sans-serif font with varying weights for hierarchy
- **Typographic Hierarchy**: Bold headings, medium subheadings, regular body text
- **Font Personality**: Clean, professional, readable
- **Readability Focus**: Generous line height, optimal character count
- **Typography Consistency**: Consistent sizes and weights across similar elements
- **Which fonts**: Inter, a professional and highly readable Google font
- **Legibility Check**: Inter provides excellent legibility at all sizes

### Visual Hierarchy & Layout
- **Attention Direction**: Form on top, results highlighted below, budget status prominently displayed, reporting dashboard with clear visualizations
- **White Space Philosophy**: Generous spacing for form groups, compact results display
- **Grid System**: Simple card-based layout with consistent padding
- **Responsive Approach**: Stack form elements vertically on mobile
- **Content Density**: Focused density around calculated results, budget visualizations, and dashboard reports

### Animations
- **Purposeful Meaning**: Subtle transitions when calculation values change
- **Hierarchy of Movement**: No animations on inputs, gentle animations on outputs
- **Contextual Appropriateness**: Minimal animations to maintain professional feel

### Data Visualization
- **Chart Types**: Bar charts for cost comparison and budget visualization, line charts for trend analysis
- **Chart Purpose**: Visual representation of forecasted vs. actual costs, budget allocation, and performance metrics across regions
- **Chart Styling**: Consistent color scheme with the application
- **Chart Interactivity**: Hover tooltips to show exact values, filter controls to refine data view
- **Dashboard Visualization**: Filterable charts showing aggregate data by region, country, and time period
- **Budget Visualization**: Progress bars to show percentage of budget utilized with clear warning indicators
- **Reporting Features**: 
  - Filters for region, country, and quarter
  - Bar charts comparing forecasted vs. actual costs by region
  - Bar charts comparing forecasted vs. actual leads, MQLs, and SQLs
  - Summary metrics panel with key performance indicators
  - Exportable data in CSV format
  - Responsive design for all screen sizes

### UI Elements & Component Selection
- **Component Usage**: Form components (Select, Input, Switch, Card) for inputs; Card for results; Tabs for separating planning, execution, and reporting sections
- **Component Customization**: Rounded corners, subtle shadows
- **Component States**: Clear hover and focus states for interactive elements
- **Icon Selection**: Calculator, chart, and status icons where appropriate
- **Component Hierarchy**: Form card primary, results card secondary, execution tracking card tertiary, reporting dashboard card quaternary
- **Spacing System**: Consistent 4px-based spacing (p-4, m-2, etc.)
- **Mobile Adaptation**: Full-width inputs on mobile, responsive charts and filters

### Visual Consistency Framework
- **Design System Approach**: Component-based design
- **Style Guide Elements**: Colors, typography, spacing
- **Visual Rhythm**: Consistent spacing between form groups
- **Brand Alignment**: Professional appearance for business context

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance for all text elements

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Users entering negative or unrealistic values; tracking status changes over time; filtering with no matching data
- **Edge Case Handling**: Input validation to ensure positive numbers; clear status indicators; empty state messaging for filtered results
- **Technical Constraints**: Form needs to handle both text and numeric inputs; URL validation for issue links; export functionality for filtered data

## Implementation Considerations
- **Scalability Needs**: Potential to add more calculation fields, execution metrics, and reporting dimensions later
- **Testing Focus**: Validate calculation accuracy, status transitions, and report filtering logic
- **Critical Questions**: Are the calculation formulas accurate to business needs? Do the execution tracking fields cover all necessary information? Does the reporting dashboard provide actionable insights?

## Reflection
- This approach provides a comprehensive tool that spans the entire campaign lifecycle from planning to execution to analysis.
- We assume users understand the terminology, calculation relationships, and execution tracking workflow.
- Adding the ability to save campaigns, export calculations, and visualize historical performance would make this solution truly exceptional.