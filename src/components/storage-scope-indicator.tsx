import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Globe, User } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StorageScopeIndicatorProps {
  scope: 'global' | 'user';
}

export function StorageScopeIndicator({ scope = 'global' }: StorageScopeIndicatorProps) {
  const isGlobal = scope === 'global';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isGlobal ? "default" : "outline"} 
            className={`gap-1 cursor-help ${isGlobal ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {isGlobal ? (
              <>
                <Globe size={14} weight="fill" />
                <span>Shared</span>
              </>
            ) : (
              <>
                <User size={14} weight="fill" />
                <span>Personal</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isGlobal 
            ? 'Data is shared with all users' 
            : 'Data is only visible to you'
          }</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}