import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-[#EFF8EF] text-[#5C8F63] hover:bg-[#E0F2E0]",
  secondary: "bg-[#F6EFE7] text-[#7A6758] hover:bg-[#EFE4D8]",
  destructive: "bg-[#FFF0EA] text-[#C96B4D] hover:bg-[#FFE1D5]",
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
