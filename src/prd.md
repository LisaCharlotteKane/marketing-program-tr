# Marketing Campaign Calculator PRD

## Core Purpose & Success
- **Mission Statement**: A real-time calculator for marketing teams to forecast campaign performance metrics and financial outcomes, with execution tracking and data-driven reporting.
- **Success Indicators**: Accurate calculations, intuitive table-based inputs, clear visualization of results, effective tracking of campaign execution, and comprehensive reporting dashboards.
- **Experience Qualities**: Efficient, Professional, Responsive

## Project Classification & Approach
- **Complexity Level**: Light Application (table-based data entry with real-time calculations, status tracking, and reporting)
- **Primary User Activity**: Creating, Tracking, and Analyzing (inputting data, updating status, and reviewing performance)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Marketing teams need to quickly estimate campaign performance metrics for multiple initiatives, track execution status, and analyze aggregate data across regions and time periods.
- **User Context**: Users will engage with this tool during campaign planning, budget meetings, execution reviews, and quarterly performance reporting.
- **Critical Path**: Add campaign entry → Input campaign details → View calculated metrics → Manage multiple campaigns → Update execution status → Monitor budget utilization → Generate reports
- **Key Moments**: 
  1. Adding and managing multiple campaign entries in a table format
  2. Viewing the real-time calculation of derived metrics for each campaign
  3. Seeing the total financial impact (pipeline value) across all campaigns
  4. Updating campaign execution status and details
  5. Analyzing filtered data across multiple campaigns

## Essential Features
1. **Table-Based Campaign Planning**
   - What: Interactive table with multiple rows for campaign entries, each with dropdown selectors, text inputs, and numeric fields
   - Why: Enable planning and tracking of multiple campaigns in a single view
   - Success: Users can efficiently add, edit, and remove multiple campaign entries

2. **Live Calculations Per Row**
   - What: Real-time calculation of MQLs, SQLs, Opportunities, and Pipeline value for each campaign row
   - Why: Provide immediate feedback on each campaign's potential
   - Success: Calculations update instantly and accurately per row

3. **Campaign Data Management**
   - What: Add/remove capabilities, export functionality, and total calculations
   - Why: Enable comprehensive management of multiple campaigns
   - Success: Users can efficiently organize their campaign data

4. **Execution Tracking**
   - What: Fields to track campaign status, PO status, campaign codes, issue links, and actual costs with visualization
   - Why: Enable teams to monitor campaign progress and compare actual vs. forecasted performance
   - Success: Users can effectively update campaign status and visualize cost comparisons throughout its lifecycle

5. **Budget Management**
   - What: Regional budget tracking and comparison against forecasted and actual costs, including cross-regional "Digital" campaigns
   - Why: Enable financial oversight and budget adherence across regions and for digital initiatives
   - Success: Clear visual indicators when budgets are exceeded with appropriate alerts

6. **Reporting Dashboard**
   - What: Filterable dashboard with visualizations and summary metrics across campaigns
   - Why: Enable analysis of aggregated campaign data for better decision making
   - Success: Users can filter data by region, country, and quarter to gain actionable insights

7. **ROI Dashboard**
   - What: Visual dashboard showing ROI metrics, funnel progression, and performance indicators based on campaign table data
   - Why: Provide at-a-glance insight into campaign effectiveness and return on investment
   - Success: Accurate ROI calculation and visualization that updates dynamically with campaign changes

8. **Cross-Regional Campaign Management**
   - What: Support for "Digital" campaign region with ability to select multiple impacted regions
   - Why: Enable proper tracking and attribution of campaigns that span multiple regions
   - Success: Digital campaigns can be properly budgeted and their impact across regions can be tracked

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Confidence, clarity, professionalism
- **Design Personality**: Professional, clean, organized
- **Visual Metaphors**: Dashboard, spreadsheet, progress tracker
- **Simplicity Spectrum**: Focused interface with data-dense table layout

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
- **Readability Focus**: Compact but readable text in table cells
- **Typography Consistency**: Consistent sizes and weights across similar elements
- **Which fonts**: Inter, a professional and highly readable Google font
- **Legibility Check**: Inter provides excellent legibility even at smaller sizes needed for table cells

### Visual Hierarchy & Layout
- **Attention Direction**: Table with campaign entries at the top, calculated fields clearly distinguished, total row at bottom
- **White Space Philosophy**: Compact spacing for table rows, clear headers
- **Grid System**: Table-based layout with consistent column widths
- **Responsive Approach**: Horizontal scrolling for tables on mobile
- **Content Density**: High density in the table for efficient data entry and review

### Table Design & UX
- **Column Organization**: Group related fields together, calculation fields at the end
- **Cell Styling**: Clear distinction between editable and read-only cells
- **Interaction Design**: Inline editing, dropdown menus, multi-select controls
- **Row Management**: Add/remove functionality with clear visual cues
- **Totals Row**: Prominent display of aggregated values

### Animations
- **Purposeful Meaning**: Subtle transitions when rows are added/removed
- **Hierarchy of Movement**: No animations on inputs, gentle animations on outputs
- **Contextual Appropriateness**: Minimal animations to maintain professional feel

### Data Visualization
- **Chart Types**: Bar charts for cost comparison and budget visualization, line charts for trend analysis, ROI gauge
- **Chart Purpose**: Visual representation of forecasted vs. actual costs, budget allocation, ROI metrics, and performance metrics across regions
- **Chart Styling**: Consistent color scheme with the application
- **Chart Interactivity**: Hover tooltips to show exact values, filter controls to refine data view
- **Dashboard Visualization**: Filterable charts showing aggregate data by region, country, and time period
- **ROI Visualization**: Gauge chart showing ROI percentage with color-coded indicators for performance levels
- **Lead Funnel Visualization**: Bar chart showing progression from leads to MQLs to SQLs to opportunities
- **Budget Visualization**: Progress bars to show percentage of budget utilized with clear warning indicators
- **Reporting Features**: 
  - Filters for region, country, and quarter
  - Bar charts comparing forecasted vs. actual costs by region
  - Bar charts comparing forecasted vs. actual leads, MQLs, and SQLs
  - Summary metrics panel with key performance indicators
  - Exportable data in CSV format
  - Responsive design for all screen sizes

### UI Elements & Component Selection
- **Component Usage**: Table components for campaign planning; Form components (Select, Input, Switch) for cell editing; Tabs for separating planning, execution, and reporting sections
- **Component Customization**: Compact design for table cells, clear section headings
- **Component States**: Clear hover and focus states for interactive elements
- **Icon Selection**: Table, add/remove, chart, and status icons where appropriate
- **Component Hierarchy**: Campaign table primary, budget management secondary, reporting dashboard tertiary
- **Spacing System**: Tighter spacing within table cells, consistent padding for sections
- **Mobile Adaptation**: Horizontal scrolling for tables, responsive charts and filters

### Visual Consistency Framework
- **Design System Approach**: Component-based design with table focus
- **Style Guide Elements**: Colors, typography, spacing, table styling
- **Visual Rhythm**: Consistent column widths and row heights
- **Brand Alignment**: Professional appearance for business context

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance for all text elements
- **Keyboard Navigation**: Full keyboard accessibility for table navigation and editing
- **Screen Reader Support**: Properly labeled table cells and interactive elements

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Managing many campaigns in a single view; validating multi-column entries; maintaining visual clarity with dense data
- **Edge Case Handling**: Pagination or filtering for large datasets; inline validation; clear visual separation between rows
- **Technical Constraints**: Table responsiveness on mobile; performance with many rows; export formatting

## Implementation Considerations
- **Scalability Needs**: Potential to handle hundreds of campaign entries, additional columns, and more complex filtering
- **Testing Focus**: Validate table interactions, calculation accuracy, data export functionality
- **Critical Questions**: Does the table format make data entry more efficient? Are all important fields accessible? Does the export functionality capture all relevant data?

## Reflection
- This table-based approach provides a more spreadsheet-like experience that marketing teams will find familiar and efficient.
- We assume users are comfortable with dense data entry interfaces and understand the calculation relationships.
- Adding inline data validation, row filtering/sorting, and the ability to save campaign sets would make this solution truly exceptional.