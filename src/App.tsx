import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calculator, ChartLineUp } from "@phosphor-icons/react"

function App() {
  // Form state
  const [campaignOwner, setCampaignOwner] = useState("")
  const [programType, setProgramType] = useState("")
  const [strategicPillars, setStrategicPillars] = useState<string[]>([])
  const [revenuePlay, setRevenuePlay] = useState("")
  const [forecastedCost, setForecastedCost] = useState<number | "">("")
  const [expectedLeads, setExpectedLeads] = useState<number | "">("")

  // Calculated metrics
  const [mql, setMql] = useState(0)
  const [sql, setSql] = useState(0)
  const [opportunities, setOpportunities] = useState(0)
  const [pipeline, setPipeline] = useState(0)

  // Preset data
  const programTypes = ["Event", "Webinar", "Content", "Email", "Social", "Paid Media", "Partner"]
  const pillars = ["Customer Acquisition", "Customer Retention", "Brand Awareness", "Market Expansion", "Product Launch"]
  const revenuePlays = ["New Business", "Cross-sell", "Upsell", "Renewal", "Reactivation"]

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

  return (
    <div className="min-h-screen bg-background font-sans text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Marketing Campaign Calculator</h1>
          <p className="text-muted-foreground">Forecast campaign performance and financial outcomes</p>
        </header>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" /> Campaign Parameters
            </CardTitle>
            <CardDescription>Enter your campaign details to calculate expected outcomes</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
                  {programTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
      </div>
    </div>
  )
}

export default App