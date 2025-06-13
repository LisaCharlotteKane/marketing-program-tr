import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartBar, DownloadSimple, Filter, FunnelSimple, CurrencyCircleDollar, SquaresFour } from "@phosphor-icons/react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

import { 
  filterCampaigns, 
  calculateSummaryMetrics, 
  prepareRegionalCostData, 
  prepareLeadsComparisonData,
  exportToCSV,
  quarters,
  regions,
  getCountriesByRegion
} from "@/lib/dashboard-utils"

export interface ReportingDashboardProps {
  campaigns?: any[];
}

export function ReportingDashboard({ campaigns = [] }: ReportingDashboardProps) {
  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("_all")
  const [selectedCountry, setSelectedCountry] = useState("_all")
  const [selectedQuarter, setSelectedQuarter] = useState("_all")
  const [availableCountries, setAvailableCountries] = useState([])
  
  // Data states
  const [filteredCampaigns, setFilteredCampaigns] = useState([])
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalForecastedSpend: 0,
    totalActualSpend: 0,
    totalPipelineForecast: 0,
    totalMQLs: 0,
    totalSQLs: 0,
    totalActualMQLs: 0,
    totalActualSQLs: 0
  })
  const [regionalCostData, setRegionalCostData] = useState([])
  const [leadsComparisonData, setLeadsComparisonData] = useState([])

  // Update available countries when region changes
  useEffect(() => {
    if (selectedRegion && selectedRegion !== "_all") {
      setAvailableCountries(getCountriesByRegion(selectedRegion))
      // Reset country selection when region changes
      setSelectedCountry("_all")
    } else {
      setAvailableCountries([])
    }
  }, [selectedRegion])

  // Update filtered data when filters change
  useEffect(() => {
    // If campaigns were passed as props, filter those directly
    // Otherwise use the utility function to get from storage
    const filtered = campaigns.length > 0 
      ? campaigns.filter(campaign => {
          // Apply region filter
          if (selectedRegion && selectedRegion !== "_all" && campaign.region !== selectedRegion) {
            return false;
          }
          
          // Apply country filter
          if (selectedCountry && selectedCountry !== "_all" && campaign.country !== selectedCountry) {
            return false;
          }
          
          // Apply quarter filter
          if (selectedQuarter && selectedQuarter !== "_all" && campaign.quarterMonth !== selectedQuarter) {
            return false;
          }
          
          return true;
        })
      : filterCampaigns(selectedRegion, selectedCountry, selectedQuarter);
    
    setFilteredCampaigns(filtered);
    
    // Calculate summary metrics
    setSummaryMetrics(calculateSummaryMetrics(filtered));
    
    // Prepare data for charts
    setRegionalCostData(prepareRegionalCostData(filtered));
    setLeadsComparisonData(prepareLeadsComparisonData(filtered));
  }, [selectedRegion, selectedCountry, selectedQuarter, campaigns]);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedRegion("_all")
    setSelectedCountry("_all")
    setSelectedQuarter("_all")
  }

  // Handle export to CSV
  const handleExport = () => {
    exportToCSV(filteredCampaigns);
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Dashboard Filters
          </CardTitle>
          <CardDescription>Filter campaign data by region, country, and quarter</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Region Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="filter-region">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-country">Country</Label>
              <Select 
                value={selectedCountry} 
                onValueChange={setSelectedCountry}
                disabled={selectedRegion === "_all"}
              >
                <SelectTrigger id="filter-country">
                  <SelectValue placeholder={selectedRegion !== "_all" ? "All Countries" : "Select a region first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Countries</SelectItem>
                  {availableCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quarter Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-quarter">Quarter</Label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger id="filter-quarter">
                  <SelectValue placeholder="All Quarters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Quarters</SelectItem>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button 
                variant="default" 
                className="flex-1 gap-1"
                onClick={handleExport}
              >
                <DownloadSimple className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Applied Filters */}
          {(selectedRegion !== "_all" || selectedCountry !== "_all" || selectedQuarter !== "_all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="text-sm text-muted-foreground mr-1">Applied filters:</div>
              {selectedRegion !== "_all" && (
                <Badge variant="outline" className="text-xs">
                  Region: {selectedRegion}
                </Badge>
              )}
              {selectedCountry !== "_all" && (
                <Badge variant="outline" className="text-xs">
                  Country: {selectedCountry}
                </Badge>
              )}
              {selectedQuarter !== "_all" && (
                <Badge variant="outline" className="text-xs">
                  Quarter: {selectedQuarter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <SquaresFour className="h-5 w-5" /> Summary Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators across {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card rounded-md p-3 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Forecasted Spend</div>
              <div className="text-xl font-semibold">{formatCurrency(summaryMetrics.totalForecastedSpend)}</div>
            </div>
            <div className="bg-card rounded-md p-3 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Actual Spend</div>
              <div className="text-xl font-semibold">{formatCurrency(summaryMetrics.totalActualSpend)}</div>
            </div>
            <div className="bg-accent rounded-md p-3 shadow-sm">
              <div className="text-sm text-accent-foreground mb-1">Pipeline Forecast</div>
              <div className="text-xl font-semibold text-accent-foreground">{formatCurrency(summaryMetrics.totalPipelineForecast)}</div>
            </div>
            <div className="bg-card rounded-md p-3 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total MQLs (10%)</div>
              <div className="text-xl font-semibold flex justify-between">
                <span>{summaryMetrics.totalMQLs}</span>
                {summaryMetrics.totalActualMQLs > 0 && (
                  <span className="text-sm text-muted-foreground self-end">
                    Act: {summaryMetrics.totalActualMQLs}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-card rounded-md p-3 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total SQLs (6%)</div>
              <div className="text-xl font-semibold flex justify-between">
                <span>{summaryMetrics.totalSQLs}</span>
                {summaryMetrics.totalActualSQLs > 0 && (
                  <span className="text-sm text-muted-foreground self-end">
                    Act: {summaryMetrics.totalActualSQLs}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Comparison Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CurrencyCircleDollar className="h-5 w-5" /> Forecasted vs Actual Cost
            </CardTitle>
            <CardDescription>Cost comparison by region</CardDescription>
          </CardHeader>

          <CardContent>
            {regionalCostData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionalCostData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="region" />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(value) => `Region: ${value}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="forecastedCost" 
                      name="Forecasted Cost"
                      fill="var(--primary)" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="actualCost" 
                      name="Actual Cost"
                      fill="var(--accent)" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
                No data available for the selected filters
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Comparison Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FunnelSimple className="h-5 w-5" /> Lead Generation Metrics
            </CardTitle>
            <CardDescription>Forecasted vs actual lead metrics</CardDescription>
          </CardHeader>

          <CardContent>
            {leadsComparisonData.length > 0 && leadsComparisonData[0].Leads > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadsComparisonData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                    barGap={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="Leads" 
                      fill="var(--primary)" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="MQLs" 
                      fill="var(--accent)" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="SQLs" 
                      fill="var(--secondary)" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
                No leads data available for the selected filters
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign List Preview */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5" /> Campaign List
          </CardTitle>
          <CardDescription>
            Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} {(selectedRegion !== "_all" || selectedCountry !== "_all" || selectedQuarter !== "_all") ? 'matching your filters' : ''}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredCampaigns.length > 0 ? (
            <div className="border rounded-md overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Impacted Regions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quarter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Program Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Forecasted Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actual Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredCampaigns.map(campaign => (
                    <tr key={campaign.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{campaign.region}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{campaign.country}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {campaign.impactedRegions && campaign.impactedRegions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {campaign.impactedRegions.map(region => (
                              <Badge key={region} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{campaign.quarterMonth}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{campaign.owner}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{campaign.campaignType}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Badge 
                          className={`${
                            campaign.status === "Planning" ? "bg-blue-100 text-blue-800" : 
                            campaign.status === "On Track" ? "bg-yellow-100 text-yellow-800" :
                            campaign.status === "Shipped" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          } px-2 py-0.5 rounded-full text-xs`}
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(campaign.forecastedCost)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(campaign.actualCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found matching your filter criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}