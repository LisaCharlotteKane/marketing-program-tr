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
import { Calculator, ChartLineUp, ClipboardText, Sparkle, ChartBar, Buildings, Warning, X, PresentationChart, Table } from "@phosphor-icons/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ReportingDashboard } from "@/components/reporting-dashboard"
import { CampaignTable, Campaign } from "@/components/campaign-table"
import { ExecutionTracking } from "@/components/execution-tracking"

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
    "South Asia": { assignedBudget: "", programs: [] },
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
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"]
  const regions = ["SAARC", "North Asia", "South Asia", "Digital"]
  
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
  
  // Handle numeric input changes
  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    const value = e.target.value;
    if (value === "") {
      setter("");
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setter(numValue);
      }
    }
  };

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
        
                            disabled={isCampaignLocked(campaign)}
                          />
                          {campaign.issueLink && (
                            <a 
                              href={campaign.issueLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* Actual Cost */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualCost === "" ? "" : campaign.actualCost}
                          onChange={(e) => handleNumericChange(campaign.id, 'actualCost', e.target.value)}
                          placeholder="USD"
                          className="w-[100px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Actual Leads */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualLeads === "" ? "" : campaign.actualLeads}
                          onChange={(e) => handleNumericChange(campaign.id, 'actualLeads', e.target.value)}
                          placeholder="#"
                          className="w-[80px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Actual MQLs */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualMQLs === "" ? "" : campaign.actualMQLs}
                          onChange={(e) => handleNumericChange(campaign.id, 'actualMQLs', e.target.value)}
                          placeholder="#"
                          className="w-[80px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Forecasted Cost (read-only) */}
                      <TableCell className="text-muted-foreground">
                        {typeof campaign.forecastedCost === 'number' 
                          ? formatCurrency(campaign.forecastedCost) 
                          : "$0"}
                      </TableCell>

                      {/* Variance */}
                      <TableCell>
                        {hasBothCosts && (
                          <div className={`${variance && variance > 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(variance || 0)} 
                            {variancePercent !== null && (
                              <span className="text-xs ml-1">
                                ({variancePercent > 0 ? "+" : ""}{Math.round(variancePercent)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {filteredCampaigns.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Total Costs:
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totalActualCost)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totalForecastedCost)}
                  </TableCell>
                  <TableCell className={`font-bold ${totalActualCost > totalForecastedCost ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(totalActualCost - totalForecastedCost)}
                    {totalForecastedCost > 0 && (
                      <span className="text-xs ml-1">
                        ({Math.round((totalActualCost / totalForecastedCost - 1) * 100)}%)
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}