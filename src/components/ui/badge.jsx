import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-[#dde5d4] text-[#5a6b4f] hover:bg-[#cdd9c4]",
  secondary: "bg-[#e8dfd0] text-[#6b5d4f] hover:bg-[#d4cbb8]",
  destructive: "bg-[#e5d0c8] text-[#a0522d] hover:bg-[#d9c0b5]",
  outline: "text-foreground border border-border",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
