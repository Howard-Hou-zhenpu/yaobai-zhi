import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(139,115,85,0.2)]",
    destructive: "bg-[#e5d0c8] text-[#a0522d] hover:bg-[#d9c0b5]",
    outline: "border border-border bg-card text-foreground hover:bg-[#e8dfd0]",
    secondary: "bg-[#e8dfd0] text-[#6b5d4f] hover:bg-[#d4cbb8]",
    ghost: "hover:bg-[#e8dfd0] hover:text-foreground text-[#6b5d4f]",
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
