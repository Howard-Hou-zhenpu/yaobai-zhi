import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/85 shadow-[0_2px_8px_rgba(139,115,85,0.15)]",
    destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-[0_2px_8px_rgba(160,82,45,0.15)]",
    outline: "border border-border bg-card hover:bg-accent hover:text-accent-foreground shadow-[0_1px_4px_rgba(139,115,85,0.08)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_1px_4px_rgba(139,115,85,0.08)]",
    ghost: "hover:bg-accent/50 hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-xl px-3 text-xs",
    lg: "h-12 rounded-2xl px-8 text-base",
    icon: "h-10 w-10",
  },
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
