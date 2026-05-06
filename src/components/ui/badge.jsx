import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-[#EAF6F2] text-[#3F8677] hover:bg-[#D9F0EA]",
  secondary: "bg-[#F0F5F3] text-[#5F706B] hover:bg-[#E6EEEA]",
  destructive: "bg-[#FFF0ED] text-[#C95F52] hover:bg-[#FFE1DA]",
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
