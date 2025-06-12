import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Calculator, ChartLineUp, ClipboardText, Sparkle, ChartBar, Buildings, Warning, X, PresentationChart } from "@phosphor-icons/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ReportingDashboard } from "@/components/reporting-dashboard"

// Type definitions for regional budget tracking
interface RegionalBudget {
  assignedBudget: number | "";
  programs: {
    id: string;
    forecastedCost: number;
    actualCost: number;
  }[];
}

interface RegionalBudgets {
  [key: string]: RegionalBudget;
}

function App() {
  // Form state
  const [campaignOwner, setCampaignOwner] = useState("")
  const [programType, setProgramType] = useState("_none")
  const [campaignType, setCampaignType] = useState("_none")
  const [country, setCountry] = useState("_none")
  const [strategicPillars, setStrategicPillars] = useState<string[]>([])
  const [revenuePlay, setRevenuePlay] = useState("_none")
  const [forecastedCost, setForecastedCost] = useState<number | "">("")
  const [expectedLeads, setExpectedLeads] = useState<number | "">("")
  
  // Region selection
  const [selectedRegion, setSelectedRegion] = useState("_all")

  // Calculated metrics
  const [mql, setMql] = useState(0)
  const [sql, setSql] = useState(0)
  const [opportunities, setOpportunities] = useState(0)
  const [pipeline, setPipeline] = useState(0)
  
  // Execution tracking state
  const [status, setStatus] = useState("_none")
  const [poRaised, setPoRaised] = useState(false)
  const [campaignCode, setCampaignCode] = useState("")
  const [issueLink, setIssueLink] = useState("")
  const [actualCost, setActualCost] = useState<number | "">("")
  
  // Regional budget management
  const [regionalBudgets, setRegionalBudgets] = useState<RegionalBudgets>({
    "SAARC": { assignedBudget: "", programs: [] },
    "North Asia": { assignedBudget: "", programs: [] },
    "South Asia": { assignedBudget: "", programs: [] }
  })
  
  // Program ID for tracking
  const [programId, setProgramId] = useState<string>("")

  // Preset data
  const programTypes = ["Event", "Webinar", "Content", "Email", "Social", "Paid Media", "Partner"]
  const pillars = ["Customer Acquisition", "Customer Retention", "Brand Awareness", "Market Expansion", "Product Launch"]
  const revenuePlays = ["New Business", "Cross-sell", "Upsell", "Renewal", "Reactivation"]
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"]
  const regions = ["SAARC", "North Asia", "South Asia"]
  
  // Campaign types
  const campaignTypes = [
    "In-Account Events (1:1)",
    "Exec Engagement Programs",
    "CxO Events (1:Few)",
    "Localized Events",
    "Localized Programs",
    "Lunch & Learns and Workshops (1:Few)",
    "Microsoft",
    "Partners",
    "Webinars",
    "3P Sponsored Events",
    "Flagship Events (Galaxy, Universe Recaps) (1:Many)",
    "Targeted Paid Ads & Content Syndication",
    "User Groups",
    "Contractor/Infrastructure"
  ]
  
  // Countries (sorted alphabetically)
  const countries = [
    "Afghanistan",
    "Australia",
    "Bangladesh",
    "Bhutan",
    "Brunei",
    "Cambodia",
    "China",
    "Hong Kong",
    "India",
    "Indonesia",
    "Japan",
    "Laos",
    "Malaysia",
    "Maldives",
    "Myanmar",
    "Nepal",
    "New Zealand",
    "Pakistan",
    "Philippines",
    "Singapore",
    "South Korea",
    "Sri Lanka",
    "Taiwan",
    "Thailand",
    "Vietnam",
    "X Apac"
  ]

  // Generate a simple ID for programs
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  }

  // Initialize program ID if not set
  useEffect(() => {
    if (!programId) {
      setProgramId(generateId());
    }
  }, [programId]);

  // Handle strategic pillar selection
  const togglePillar = (pillar: string) => {
    setStrategicPillars(prev => 
      prev.includes(pillar) 
        ? prev.filter(p => p !== pillar) 
        : [...prev, pillar]
    )
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate budget metrics for a region
  const calculateRegionalMetrics = (region: string) => {
    const budgetData = regionalBudgets[region];
    if (!budgetData) return { totalForecasted: 0, totalActual: 0 };

    const totalForecasted = budgetData.programs.reduce((sum, program) => sum + program.forecastedCost, 0);
    const totalActual = budgetData.programs.reduce((sum, program) => sum + program.actualCost, 0);

    return { totalForecasted, totalActual };
  }

  // Update regional budget program data
  const updateRegionalProgramData = () => {
    if (!selectedRegion || typeof forecastedCost !== 'number') return;

    setRegionalBudgets(prev => {
      const currentPrograms = [...prev[selectedRegion].programs];
      
      // Find if the current program already exists
      const programIndex = currentPrograms.findIndex(p => p.id === programId);
      
      if (programIndex >= 0) {
        // Update existing program
        currentPrograms[programIndex] = {
          ...currentPrograms[programIndex],
          forecastedCost: forecastedCost || 0,
          actualCost: typeof actualCost === 'number' ? actualCost : 0
        };
      } else {
        // Add new program
        currentPrograms.push({
          id: programId,
          forecastedCost: forecastedCost || 0,
          actualCost: typeof actualCost === 'number' ? actualCost : 0
        });
      }
      
      return {
        ...prev,
        [selectedRegion]: {
          ...prev[selectedRegion],
          programs: currentPrograms
        }
      };
    });
  }

  // Calculate derived metrics whenever inputs change
  useEffect(() => {
    // Only calculate if we have numeric values
    if (typeof expectedLeads === 'number') {
      const mqlValue = Math.round(expectedLeads * 0.1) // 10% of leads
      setMql(mqlValue)
      
      const sqlValue = Math.round(expectedLeads * 0.06) // 6% of leads
      setSql(sqlValue)
      
      const oppsValue = Math.round(sqlValue * 0.8) // 80% of SQLs
      setOpportunities(oppsValue)
      
      const pipelineValue = oppsValue * 50000 // $50K per opportunity
      setPipeline(pipelineValue)
    } else {
      // Reset calculations if no valid input
      setMql(0)
      setSql(0)
      setOpportunities(0)
      setPipeline(0)
    }
  }, [expectedLeads])

  // Update regional program data when forecasted or actual costs change
  useEffect(() => {
    if (selectedRegion) {
      updateRegionalProgramData();
    }
  }, [forecastedCost, actualCost, selectedRegion])

  // Reset form for new program
  const resetForm = () => {
    setCampaignOwner("");
    setProgramType("_none");
    setCampaignType("_none");
    setCountry("_none");
    setStrategicPillars([]);
    setRevenuePlay("_none");
    setForecastedCost("");
    setExpectedLeads("");
    setStatus("_none");
    setPoRaised(false);
    setCampaignCode("");
    setIssueLink("");
    setActualCost("");
    setProgramId(generateId());
  }

  // Handle numeric input changes
  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    const value = e.target.value
    
    if (value === "") {
      setter("")
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setter(numValue)
      }
    }
  }

  // Handle regional budget change
  const handleRegionalBudgetChange = (region: string, value: string) => {
    if (value === "") {
      setRegionalBudgets(prev => ({
        ...prev,
        [region]: {
          ...prev[region],
          assignedBudget: ""
        }
      }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setRegionalBudgets(prev => ({
          ...prev,
          [region]: {
            ...prev[region],
            assignedBudget: numValue
          }
        }));
      }
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Marketing Campaign Calculator</h1>
          <p className="text-muted-foreground">Forecast campaign performance and track execution</p>
        </header>

        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Planning
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <ClipboardText className="h-4 w-4" /> Execution Tracking
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Buildings className="h-4 w-4" /> Budget Management
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <PresentationChart className="h-4 w-4" /> Reporting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" /> Campaign Parameters
                </CardTitle>
                <CardDescription>Enter your campaign details to calculate expected outcomes</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Region Selection */}
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger id="region" className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campaign Owner */}
                <div className="space-y-2">
                  <Label htmlFor="campaign-owner">Campaign Owner</Label>
                  <Input 
                    id="campaign-owner" 
                    placeholder="Enter owner name" 
                    value={campaignOwner}
                    onChange={(e) => setCampaignOwner(e.target.value)}
                  />
                </div>

                {/* Program Type */}
                <div className="space-y-2">
                  <Label htmlFor="program-type">Program Type</Label>
                  <Select value={programType} onValueChange={setProgramType}>
                    <SelectTrigger id="program-type" className="w-full">
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select type</SelectItem>
                      {programTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campaign Type */}
                <div className="space-y-2">
                  <Label htmlFor="campaign-type">Campaign Type</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger id="campaign-type" className="w-full">
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select campaign type</SelectItem>
                      {campaignTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select country</SelectItem>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Strategic Pillar */}
                <div className="space-y-2">
                  <Label>Strategic Pillar (select multiple)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {pillars.map(pillar => (
                      <div key={pillar} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`pillar-${pillar}`} 
                          checked={strategicPillars.includes(pillar)}
                          onCheckedChange={() => togglePillar(pillar)}
                        />
                        <Label htmlFor={`pillar-${pillar}`} className="font-normal cursor-pointer">{pillar}</Label>
                      </div>
                    ))}
                  </div>
                  {strategicPillars.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {strategicPillars.map(pillar => (
                        <Badge key={pillar} variant="secondary" className="text-xs">
                          {pillar}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revenue Play */}
                <div className="space-y-2">
                  <Label htmlFor="revenue-play">Revenue Play</Label>
                  <Select value={revenuePlay} onValueChange={setRevenuePlay}>
                    <SelectTrigger id="revenue-play" className="w-full">
                      <SelectValue placeholder="Select revenue play" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select play</SelectItem>
                      {revenuePlays.map(play => (
                        <SelectItem key={play} value={play}>{play}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Numeric Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="forecasted-cost">Forecasted Cost ($)</Label>
                    <Input 
                      id="forecasted-cost" 
                      type="number" 
                      placeholder="Enter amount" 
                      value={forecastedCost.toString()}
                      onChange={(e) => handleNumericChange(e, setForecastedCost)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected-leads">Expected Leads</Label>
                    <Input 
                      id="expected-leads" 
                      type="number" 
                      placeholder="Enter number" 
                      value={expectedLeads.toString()}
                      onChange={(e) => handleNumericChange(e, setExpectedLeads)}
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="border shadow-sm bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ChartLineUp className="h-5 w-5" /> Calculated Outcomes
                </CardTitle>
                <CardDescription>Estimated performance metrics based on your inputs</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-md p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">MQLs (10%)</div>
                    <div className="text-2xl font-semibold">{mql}</div>
                  </div>
                  <div className="bg-card rounded-md p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">SQLs (6%)</div>
                    <div className="text-2xl font-semibold">{sql}</div>
                  </div>
                  <div className="bg-card rounded-md p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Opportunities (80% of SQL)</div>
                    <div className="text-2xl font-semibold">{opportunities}</div>
                  </div>
                  <div className="bg-accent rounded-md p-3 shadow-sm">
                    <div className="text-sm text-accent-foreground mb-1">Pipeline ($50K × Opps)</div>
                    <div className="text-2xl font-semibold text-accent-foreground">{formatCurrency(pipeline)}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="text-sm text-muted-foreground">
                {forecastedCost && typeof forecastedCost === 'number' && pipeline > 0 ? (
                  <div>
                    ROI: {Math.round((pipeline / forecastedCost) * 100) / 100}x
                  </div>
                ) : (
                  <div>Enter expected leads to see calculated outcomes</div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="h-5 w-5" /> Execution Status
                </CardTitle>
                <CardDescription>Track the current state of your marketing campaign</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select campaign status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select status</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* PO Raised */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="po-raised">PO Raised?</Label>
                    <div className="text-sm text-muted-foreground">Has a purchase order been issued</div>
                  </div>
                  <Switch
                    id="po-raised"
                    checked={poRaised}
                    onCheckedChange={setPoRaised}
                  />
                </div>

                {/* Salesforce Campaign Code */}
                <div className="space-y-2">
                  <Label htmlFor="campaign-code">Salesforce Campaign Code</Label>
                  <Input 
                    id="campaign-code" 
                    placeholder="Enter campaign code" 
                    value={campaignCode}
                    onChange={(e) => setCampaignCode(e.target.value)}
                  />
                </div>

                {/* Issue Link */}
                <div className="space-y-2">
                  <Label htmlFor="issue-link">Issue Link</Label>
                  <Input 
                    id="issue-link" 
                    type="url"
                    placeholder="https://..." 
                    value={issueLink}
                    onChange={(e) => setIssueLink(e.target.value)}
                  />
                </div>

                {/* Actual Cost */}
                <div className="space-y-2">
                  <Label htmlFor="actual-cost">Actual Cost ($)</Label>
                  <Input 
                    id="actual-cost" 
                    type="number" 
                    placeholder="Enter actual amount spent" 
                    value={actualCost.toString()}
                    onChange={(e) => handleNumericChange(e, setActualCost)}
                    min="0"
                  />
                </div>
              </CardContent>

              {/* Cost Comparison Chart */}
              {(forecastedCost !== "" || actualCost !== "") && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <ChartBar className="h-4 w-4" />
                    Cost Comparison
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Costs',
                            Forecasted: typeof forecastedCost === 'number' ? forecastedCost : 0,
                            Actual: typeof actualCost === 'number' ? actualCost : 0,
                          },
                        ]}
                        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis 
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          domain={[0, 'auto']}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                          labelFormatter={() => ''}
                        />
                        <Legend />
                        <Bar 
                          dataKey="Forecasted" 
                          fill="var(--primary)" 
                          radius={[4, 4, 0, 0]} 
                          barSize={80}
                        />
                        <Bar 
                          dataKey="Actual" 
                          fill="var(--accent)" 
                          radius={[4, 4, 0, 0]} 
                          barSize={80}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {forecastedCost && typeof forecastedCost === 'number' && 
                   actualCost && typeof actualCost === 'number' && (
                    <div className="text-sm text-center mt-2 text-muted-foreground">
                      Variance: {formatCurrency(actualCost - forecastedCost)} 
                      ({Math.round((actualCost / forecastedCost - 1) * 100)}%)
                    </div>
                  )}
                </div>
              )}

              <CardFooter>
                {status && (
                  <div className="w-full">
                    <div className="text-sm font-medium mb-2">Status Summary</div>
                    <div className="flex items-center justify-between gap-4">
                      <Badge 
                        className={`${
                          status === "Planning" ? "bg-blue-100 text-blue-800" : 
                          status === "On Track" ? "bg-yellow-100 text-yellow-800" :
                          status === "Shipped" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        } px-3 py-1 rounded-full text-xs`}
                      >
                        {status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {forecastedCost && typeof forecastedCost === 'number' && 
                         actualCost && typeof actualCost === 'number' ? (
                          <span>
                            Budget variance: {formatCurrency(actualCost - forecastedCost)} 
                            ({Math.round((actualCost / forecastedCost - 1) * 100)}%)
                          </span>
                        ) : (
                          <span>Enter actual cost to see budget variance</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Buildings className="h-5 w-5" /> Regional Budget Management
                </CardTitle>
                <CardDescription>Assign and monitor budgets across different regions</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {regions.map(region => {
                  const { totalForecasted, totalActual } = calculateRegionalMetrics(region);
                  const assignedBudget = regionalBudgets[region]?.assignedBudget;
                  const hasAssignedBudget = typeof assignedBudget === "number";
                  
                  // Calculate budget utilization percentages
                  const forecastedPercent = hasAssignedBudget ? Math.min(100, (totalForecasted / assignedBudget) * 100) : 0;
                  const actualPercent = hasAssignedBudget ? Math.min(100, (totalActual / assignedBudget) * 100) : 0;
                  
                  // Determine warning/alert status
                  const forecastedExceedsBudget = hasAssignedBudget && totalForecasted > assignedBudget;
                  const actualExceedsBudget = hasAssignedBudget && totalActual > assignedBudget;

                  return (
                    <div key={region} className="space-y-4 border rounded-md p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{region}</h3>
                          <p className="text-sm text-muted-foreground">
                            {regionalBudgets[region]?.programs.length || 0} program(s) assigned
                          </p>
                        </div>
                        <div className="flex-1 max-w-48">
                          <Label htmlFor={`budget-${region}`}>Assigned Budget ($)</Label>
                          <Input 
                            id={`budget-${region}`}
                            type="number"
                            placeholder="Enter regional budget"
                            value={assignedBudget === "" ? "" : assignedBudget.toString()}
                            onChange={(e) => handleRegionalBudgetChange(region, e.target.value)}
                            min="0"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {hasAssignedBudget && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Forecasted Cost: {formatCurrency(totalForecasted)}</span>
                              <span>{Math.round(forecastedPercent)}% of budget</span>
                            </div>
                            <Progress value={forecastedPercent} className="h-2" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Actual Cost: {formatCurrency(totalActual)}</span>
                              <span>{Math.round(actualPercent)}% of budget</span>
                            </div>
                            <Progress value={actualPercent} className={actualExceedsBudget ? "h-2 bg-red-200" : "h-2"} />
                          </div>

                          {/* Warning/Alert Messages */}
                          {forecastedExceedsBudget && !actualExceedsBudget && (
                            <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                              <Warning className="h-4 w-4 text-yellow-600" />
                              <AlertTitle className="text-yellow-800">Warning</AlertTitle>
                              <AlertDescription className="text-yellow-700">
                                Forecasted cost ({formatCurrency(totalForecasted)}) exceeds assigned budget ({formatCurrency(assignedBudget)})
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {actualExceedsBudget && (
                            <Alert variant="destructive" className="bg-red-50 border-red-200">
                              <X className="h-4 w-4 text-red-600" />
                              <AlertTitle className="text-red-800">Critical Alert</AlertTitle>
                              <AlertDescription className="text-red-700">
                                Actual cost ({formatCurrency(totalActual)}) exceeds assigned budget ({formatCurrency(assignedBudget)})
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      {/* Budget vs. Cost Comparison Chart */}
                      {hasAssignedBudget && (
                        <div className="h-64 w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: region,
                                  Budget: assignedBudget,
                                  Forecasted: totalForecasted,
                                  Actual: totalActual,
                                },
                              ]}
                              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" />
                              <YAxis 
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                                domain={[0, 'auto']}
                              />
                              <Tooltip 
                                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                labelFormatter={() => ''}
                              />
                              <Legend />
                              <Bar 
                                dataKey="Budget" 
                                fill="var(--secondary)" 
                                radius={[4, 4, 0, 0]} 
                                barSize={80}
                              />
                              <Bar 
                                dataKey="Forecasted" 
                                fill="var(--primary)" 
                                radius={[4, 4, 0, 0]} 
                                barSize={80}
                              />
                              <Bar 
                                dataKey="Actual" 
                                fill="var(--accent)" 
                                radius={[4, 4, 0, 0]} 
                                barSize={80}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <ReportingDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App