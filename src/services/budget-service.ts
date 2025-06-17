import { RegionalBudgets } from "@/hooks/useRegionalBudgets";

export function calculateRegionalMetrics(regionalBudgets: RegionalBudgets, region: string) {
  const regionData = regionalBudgets[region] || { programs: [], assignedBudget: "" };
  
  // Calculate total forecasted cost
  const totalForecasted = regionData.programs.reduce(
    (total, program) => total + (program.forecastedCost || 0),
    0
  );
  
  // Calculate total actual cost
  const totalActual = regionData.programs.reduce(
    (total, program) => total + (program.actualCost || 0),
    0
  );
  
  // Get assigned budget (may be a number or empty string)
  const assignedBudget = regionData.assignedBudget;
  
  // Calculate percentages if budget is assigned
  const forecastedPercent = typeof assignedBudget === "number" && assignedBudget > 0 
    ? (totalForecasted / assignedBudget) * 100
    : 0;
    
  const actualPercent = typeof assignedBudget === "number" && assignedBudget > 0
    ? (totalActual / assignedBudget) * 100
    : 0;
  
  // Determine if forecasted or actual costs exceed budget
  const forecastedExceedsBudget = typeof assignedBudget === "number" && totalForecasted > assignedBudget;
  const actualExceedsBudget = typeof assignedBudget === "number" && totalActual > assignedBudget;
  
  return {
    totalForecasted,
    totalActual,
    assignedBudget,
    forecastedPercent,
    actualPercent,
    forecastedExceedsBudget,
    actualExceedsBudget
  };
}