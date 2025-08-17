import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GitHubCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "emphasized" | "subtle";
  fullWidth?: boolean;
  className?: string;
}

export const GitHubCard = ({
  title,
  description,
  children,
  icon,
  variant = "default",
  fullWidth = false,
  className
}: GitHubCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "emphasized":
        return "border-2 shadow-md";
      case "subtle":
        return "bg-muted/50";
      default:
        return "";
    }
  };

  return (
    <Card className={cn(
      getVariantClasses(),
      fullWidth && "w-full",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};