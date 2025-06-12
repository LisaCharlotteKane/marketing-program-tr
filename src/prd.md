# Marketing Campaign Calculator PRD

## Core Purpose & Success
- **Mission Statement**: A real-time calculator for marketing teams to forecast campaign performance metrics and financial outcomes.
- **Success Indicators**: Accurate calculations, intuitive form inputs, and clear visualization of results.
- **Experience Qualities**: Efficient, Professional, Responsive

## Project Classification & Approach
- **Complexity Level**: Light Application (form with real-time calculations)
- **Primary User Activity**: Creating (inputting data to generate forecasts)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Marketing teams need to quickly estimate campaign performance metrics to make informed decisions.
- **User Context**: Users will engage with this tool during campaign planning and budget meetings.
- **Critical Path**: Select campaign parameters → Input forecasted values → View calculated metrics
- **Key Moments**: 
  1. Selecting all required campaign parameters
  2. Viewing the real-time calculation of derived metrics
  3. Seeing the financial impact (pipeline value)

## Essential Features
1. **Input Form**
   - What: Form with dropdown, multi-select, and numeric inputs
   - Why: Capture necessary campaign parameters
   - Success: All inputs function properly with appropriate validation

2. **Live Calculations**
   - What: Real-time calculation of MQLs, SQLs, Opportunities, and Pipeline value
   - Why: Provide immediate feedback on campaign potential
   - Success: Calculations update instantly and accurately

3. **Clean Visual Display**
   - What: Clear presentation of inputs and calculated results
   - Why: Enable quick understanding of the forecast
   - Success: Users can easily distinguish between inputs and calculated values

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Confidence, clarity, professionalism
- **Design Personality**: Professional, clean, organized
- **Visual Metaphors**: Dashboard, calculator
- **Simplicity Spectrum**: Minimal interface to focus on the data

### Color Strategy
- **Color Scheme Type**: Monochromatic with accent
- **Primary Color**: Deep blue (#1a365d) - represents trust and professionalism
- **Secondary Colors**: Lighter blues for supporting elements
- **Accent Color**: Teal (#0d9488) for highlighting important metrics and CTAs
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
- **Attention Direction**: Form on top, results highlighted below
- **White Space Philosophy**: Generous spacing for form groups, compact results display
- **Grid System**: Simple card-based layout with consistent padding
- **Responsive Approach**: Stack form elements vertically on mobile
- **Content Density**: Focused density around calculated results

### Animations
- **Purposeful Meaning**: Subtle transitions when calculation values change
- **Hierarchy of Movement**: No animations on inputs, gentle animations on outputs
- **Contextual Appropriateness**: Minimal animations to maintain professional feel

### UI Elements & Component Selection
- **Component Usage**: Form components (Select, Input, Card) for inputs; Card for results
- **Component Customization**: Rounded corners, subtle shadows
- **Component States**: Clear hover and focus states for interactive elements
- **Icon Selection**: Calculator and chart icons where appropriate
- **Component Hierarchy**: Form card primary, results card secondary
- **Spacing System**: Consistent 4px-based spacing (p-4, m-2, etc.)
- **Mobile Adaptation**: Full-width inputs on mobile

### Visual Consistency Framework
- **Design System Approach**: Component-based design
- **Style Guide Elements**: Colors, typography, spacing
- **Visual Rhythm**: Consistent spacing between form groups
- **Brand Alignment**: Professional appearance for business context

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance for all text elements

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Users entering negative or unrealistic values
- **Edge Case Handling**: Input validation to ensure positive numbers
- **Technical Constraints**: Form needs to handle both text and numeric inputs

## Implementation Considerations
- **Scalability Needs**: Potential to add more calculation fields later
- **Testing Focus**: Validate calculation accuracy
- **Critical Questions**: Are the calculation formulas accurate to business needs?

## Reflection
- This approach provides a straightforward, professional tool focused on accuracy and clarity.
- We assume users understand the terminology and calculation relationships.
- Adding the ability to save or export calculations would make this solution truly exceptional.