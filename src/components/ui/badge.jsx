import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-primary/15 text-primary hover:bg-primary/20",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive/15 text-destructive hover:bg-destructive/20",
  outline: "text-foreground border border-border/60",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-transparent px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
