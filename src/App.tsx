import { useState, useEffect, useRef } from "react"
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
import { Calculator, ChartLineUp, ClipboardText, Sparkle, ChartBar, Buildings, Warning, X, PresentationChart, Table, Database, ArrowClockwise, LockKey, TrendUp } from "@phosphor-icons/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ReportingDashboard } from "@/components/reporting-dashboard"
import { ROIDashboard } from "@/components/roi-dashboard"
import { CampaignTable, Campaign } from "@/components/campaign-table"
import { ExecutionTracking } from "@/components/execution-tracking"
import { GitHubSync } from "@/components/github-sync"
import { PersistentStorageInfo } from "@/components/persistent-storage-info"
import { AutoSaveIndicator } from "@/components/auto-save-indicator"
import { BudgetSaveIndicator } from "@/components/budget-save-indicator"
import { BudgetLockInfo } from "@/components/budget-lock-info"
import { StorageErrorHandler } from "@/components/storage-error-handler"
import { Logo } from "@/components/logo"
import { Avatar } from "@/components/avatar"
import { ThemeSwitch } from "@/components/theme-switch"
import { Toaster, toast } from "sonner"
import { useEnhancedCampaigns } from "@/hooks/useEnhancedCampaigns"
import { useRegionalBudgets, RegionalBudget, RegionalBudgets } from "@/hooks/useRegionalBudgets"
import { runDataMigrations } from "@/services/migration-service"
import { initAutoGitHubSync } from "@/services/auto-github-sync"
import { Button } from "@/components/ui/button"
import { calculateRegionalMetrics } from "@/services/budget-service"
import { PrimerHeader } from "@/components/primer"
import { ErrorBoundary } from "@/components/error-boundary"



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

  // Run data migrations on initial load
  useEffect(() => {
    runDataMigrations().catch(error => {
      console.error("Failed to run data migrations:", error);
    });
    
    // Initialize auto GitHub sync
    initAutoGitHubSync();
  }, []);

  // Calculated metrics
  const [mql, setMql] = useState(0)
  const [sql, setSql] = useState(0)
  const [opportunities, setOpportunities] = useState(0)
  const [pipeline, setPipeline] = useState(0)
  
  // Regional budget management with persistence
  const [regionalBudgets, setRegionalBudgets, budgetStatus] = useRegionalBudgets()
  
  // Program ID for tracking
  const [programId, setProgramId] = useState<string>("")

  // Campaign Table Data
  const [campaigns, setCampaigns, saveStatus] = useEnhancedCampaigns('campaignData', [])

  // Handle manual retry of data loading - not currently used but kept for future
  const handleRetryDataLoad = () => {
    window.location.reload();
  }

  // Preset data
  const pillars = [
    "Account Growth and Product Adoption",
    "Pipeline Acceleration & Executive Engagement",
    "Brand Awareness & Top of Funnel Demand Generation",
    "New Logo Acquisition"
  ];
  const revenuePlays = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ];
  const regions = ["North APAC", "South APAC", "SAARC", "Digital Motions", "X APAC Non English", "X APAC English"];
  
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
    "ASEAN",
    "Australia",
    "Bangladesh",
    "Bhutan",
    "Brunei",
    "Cambodia",
    "China",
    "GCR",
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
    "X Apac",
    "X APAC English",
    "X APAC Non English",
    "X South APAC",
    "X SAARC"
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
          actualCost: currentPrograms[programIndex].actualCost || 0
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
    // Don't allow changes if budget is locked
    if (regionalBudgets[region]?.lockedByOwner) {
      toast.error('This budget is locked by an administrator');
      return;
    }
    
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
          forecastedCost: typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0,
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
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Toaster position="top-right" richColors closeButton />
      <div className="flex flex-col min-h-screen">
        <StorageErrorHandler onRetry={handleRetryDataLoad} />
        
        <PrimerHeader 
          title="Marketing Campaign Calculator" 
          subtitle="Forecast campaign performance and track execution" 
        />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-end mb-4">
            <AutoSaveIndicator forceSave={saveStatus.forceSave} />
          </div>
          
          <Tabs defaultValue="planning" className="w-full">
            <div className="sticky top-0 z-10 bg-background pt-2 pb-4 mb-4 border-b">
              <TabsList className="w-full flex-nowrap md:grid md:grid-cols-6 shadow-sm">
                <TabsTrigger value="planning" className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4">
                  <Calculator className="h-4 w-4 flex-shrink-0" /> 
                  <span>Planning</span>
                </TabsTrigger>
                <TabsTrigger value="execution" className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4">
                  <ClipboardText className="h-4 w-4 flex-shrink-0" /> 
                  <span>Execution</span>
                </TabsTrigger>
                <TabsTrigger value="budget" className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4">
                  <Buildings className="h-4 w-4 flex-shrink-0" /> 
                  <span>Budget</span>
                </TabsTrigger>
                <TabsTrigger value="roi" className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4">
                  <TrendUp className="h-4 w-4 flex-shrink-0" /> 
                  <span>ROI</span>
                </TabsTrigger>
                <TabsTrigger value="github" className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4">
                  <Database className="h-4 w-4 flex-shrink-0" /> 
                  <span>GitHub</span>
                </TabsTrigger>
                <TabsTrigger value="reporting" className="whitespace-nowrap flex items-center gap-2 px-3 sm:px-4">
                  <PresentationChart className="h-4 w-4 flex-shrink-0" /> 
                  <span>Reporting</span>
                </TabsTrigger>
              </TabsList>
            </div>

          <TabsContent value="planning" className="space-y-6 pt-2">
            <CampaignTable campaigns={campaigns} setCampaigns={setCampaigns} />
          </TabsContent>

          <TabsContent value="execution" className="space-y-8 pt-2">
            <ErrorBoundary>
              <ExecutionTracking campaigns={campaigns} setCampaigns={setCampaigns} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="budget" className="space-y-8 pt-2">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4 pt-5 px-6 bg-card/50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Buildings className="h-5 w-5" /> Regional Budget Management
                </CardTitle>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-col">
                    <span>Assigned and locked budgets across different regions</span>
                    <span className="text-xs mt-1 text-muted-foreground flex items-center gap-1">
                      <LockKey className="h-3 w-3" /> Admin-locked budgets cannot be modified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={budgetStatus.resetToDefaults}
                      className="flex items-center gap-1 text-xs"
                    >
                      <ArrowClockwise className="h-3 w-3" /> Reset All
                    </Button>
                    <BudgetSaveIndicator 
                      className="ml-2" 
                      lastSaved={budgetStatus.lastSaved}
                      isSaving={budgetStatus.isSaving}
                    />
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {regions.map(region => {
                  const { 
                    totalForecasted, 
                    totalActual,
                    assignedBudget,
                    forecastedPercent,
                    actualPercent,
                    forecastedExceedsBudget,
                    actualExceedsBudget,
                    forecastedOverage,
                    actualOverage
                  } = calculateRegionalMetrics(regionalBudgets, region);
                  
                  const hasAssignedBudget = typeof assignedBudget === "number";

                  return (
                    <div key={region} className="space-y-4 border rounded-md p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {region}
                            {regionalBudgets[region]?.lockedByOwner && (
                              <BudgetLockInfo 
                                region={region} 
                                budget={regionalBudgets[region]} 
                              />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {regionalBudgets[region]?.programs.length || 0} program(s) assigned
                            {(region === "X APAC English" || region === "X APAC Non English") && (
                              <span className="ml-2 text-muted-foreground italic">(No budget assignment needed)</span>
                            )}
                          </p>
                        </div>
                        <div className="flex-1 max-w-48">
                          <Label htmlFor={`budget-${region}`}>Assigned Budget ($)</Label>
                          <div className="relative">
                            <Input 
                              id={`budget-${region}`}
                              type="number"
                              placeholder="Enter regional budget"
                              value={assignedBudget === "" ? "" : assignedBudget.toString()}
                              onChange={(e) => handleRegionalBudgetChange(region, e.target.value)}
                              min="0"
                              className={`mt-1 ${regionalBudgets[region]?.lockedByOwner ? 'bg-muted pr-10' : ''}`}
                              disabled={regionalBudgets[region]?.lockedByOwner}
                            />
                            {regionalBudgets[region]?.lockedByOwner && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <LockKey className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          {regionalBudgets[region]?.lockedByOwner && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Locked by administrator
                            </p>
                          )}
                        </div>
                      </div>

                      {hasAssignedBudget && !(region === "X APAC English" || region === "X APAC Non English") && (
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
                                Forecasted cost ({formatCurrency(totalForecasted)}) exceeds assigned budget ({formatCurrency(assignedBudget as number)}) 
                                by {formatCurrency(forecastedOverage)}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {actualExceedsBudget && (
                            <Alert variant="destructive" className="bg-red-50 border-red-200">
                              <X className="h-4 w-4 text-red-600" />
                              <AlertTitle className="text-red-800">Critical Alert</AlertTitle>
                              <AlertDescription className="text-red-700">
                                Actual cost ({formatCurrency(totalActual)}) exceeds assigned budget ({formatCurrency(assignedBudget as number)})
                                by {formatCurrency(actualOverage)}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      {/* Budget vs. Cost Comparison Chart */}
                      {hasAssignedBudget && !(region === "X APAC English" || region === "X APAC Non English") && (
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

          <TabsContent value="reporting" className="space-y-8 pt-2">
            <ReportingDashboard campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="roi" className="space-y-8 pt-2">
            <ROIDashboard campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="github" className="space-y-8 pt-2">
            <PersistentStorageInfo />
            <GitHubSync campaigns={campaigns} setCampaigns={setCampaigns} />
          </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default App;