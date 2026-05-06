import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-[#3F8677] shadow-[0_4px_14px_rgba(79,157,139,0.25)]",
    destructive: "bg-[#FFF0ED] text-[#C95F52] hover:bg-[#FFE1DA] shadow-none",
    outline: "border border-border bg-card text-foreground hover:bg-[#F0F5F3]",
    secondary: "bg-[#F0F5F3] text-[#5F706B] hover:bg-[#E6EEEA]",
    ghost: "hover:bg-[#F0F5F3] hover:text-foreground text-[#6F7D78]",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-5 py-2",
    sm: "h-8 rounded-full px-3 text-xs",
    lg: "h-12 rounded-full px-8 text-base",
    icon: "h-10 w-10",
  },
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
