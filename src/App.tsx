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
import { Calculator, ChartLineUp, ClipboardText, Sparkle, ChartBar, Buildings, Warning, X, PresentationChart, Table, Database } from "@phosphor-icons/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ReportingDashboard } from "@/components/reporting-dashboard"
import { CampaignTable, Campaign } from "@/components/campaign-table"
import { ExecutionTracking } from "@/components/execution-tracking"
import { GitHubSync } from "@/components/github-sync"
import { Toaster } from "sonner"

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
  
  // Regional budget management
  const [regionalBudgets, setRegionalBudgets] = useState<RegionalBudgets>({
    "North APAC": { assignedBudget: "", programs: [] },
    "South APAC": { assignedBudget: "", programs: [] },
    "SAARC": { assignedBudget: "", programs: [] },
    "Digital": { assignedBudget: "", programs: [] }
  })
  
  // Program ID for tracking
  const [programId, setProgramId] = useState<string>("")

  // Campaign Table Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Preset data
  const pillars = [
    "Account Growth and Product Adoption",
    "Pipeline Acceleration & Executive Engagement",
    "Brand Awareness & Top of Funnel Demand Generation",
    "New Logo Acquisition"
  ]
  const revenuePlays = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ]
  const regions = ["North APAC", "South APAC", "SAARC", "Digital"]
  
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
          actualCost: 0
        };
      } else {
        // Add new program
        currentPrograms.push({
          id: programId,
          forecastedCost: forecastedCost || 0,
          actualCost: 0
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

  // Update regional program data when forecasted cost changes
  useEffect(() => {
    if (selectedRegion) {
      updateRegionalProgramData();
    }
  }, [forecastedCost, selectedRegion])

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
  
  // Update regional budgets based on campaign table data
  useEffect(() => {
    const campaignsByRegion: { [key: string]: any[] } = {};
    
    // Group campaigns by region
    campaigns.forEach(campaign => {
      if (campaign.region && typeof campaign.forecastedCost === 'number') {
        if (!campaignsByRegion[campaign.region]) {
          campaignsByRegion[campaign.region] = [];
        }
        
        campaignsByRegion[campaign.region].push({
          id: campaign.id,
          forecastedCost: campaign.forecastedCost,
          actualCost: typeof campaign.actualCost === 'number' ? campaign.actualCost : 0
        });
      }
    });
    
    // Update regional budgets
    setRegionalBudgets(prev => {
      const updated = { ...prev };
      
      // Update programs for each region
      Object.keys(campaignsByRegion).forEach(region => {
        if (updated[region]) {
          updated[region] = {
            ...updated[region],
            programs: campaignsByRegion[region]
          };
        }
      });
      
      return updated;
    });
  }, [campaigns]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground p-4 md:p-8">
      <Toaster position="top-right" richColors closeButton />
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Marketing Campaign Calculator</h1>
          <p className="text-muted-foreground">Forecast campaign performance and track execution</p>
        </header>

        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Planning
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <ClipboardText className="h-4 w-4" /> Execution Tracking
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Buildings className="h-4 w-4" /> Budget Management
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Database className="h-4 w-4" /> GitHub Sync
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <PresentationChart className="h-4 w-4" /> Reporting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" /> Campaign Planning Table
                </CardTitle>
                <CardDescription>Plan and track multiple marketing campaigns</CardDescription>
              </CardHeader>

              <CardContent className="p-0 overflow-auto">
                <CampaignTable campaigns={campaigns} setCampaigns={setCampaigns} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <ExecutionTracking campaigns={campaigns} setCampaigns={setCampaigns} />
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

          <TabsContent value="github" className="space-y-6">
            <GitHubSync campaigns={campaigns} setCampaigns={setCampaigns} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App