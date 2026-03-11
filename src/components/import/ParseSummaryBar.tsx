import React from 'react';

interface ParseSummaryBarProps {
  parsedCount: number;
  warningCount: number;
  errorCount: number;
  skippedCount: number;
}

export const ParseSummaryBar: React.FC<ParseSummaryBarProps> = ({
  parsedCount,
  warningCount,
  errorCount,
  skippedCount
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-3 rounded-xl border border-border text-sm font-medium">
      <div className="flex items-center gap-2 text-primary">
        <span>✅</span>
        <span>{parsedCount} entries parsed</span>
      </div>
      <div className="w-px h-4 bg-border hidden sm:block"></div>
      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
        <span>⚠️</span>
        <span>{warningCount} warnings</span>
      </div>
      <div className="w-px h-4 bg-border hidden sm:block"></div>
      <div className="flex items-center gap-2 text-destructive">
        <span>❌</span>
        <span>{errorCount} errors</span>
      </div>
      <div className="w-px h-4 bg-border hidden sm:block"></div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>⏭</span>
        <span>{skippedCount} skipped (empty)</span>
      </div>
    </div>
  );
};
