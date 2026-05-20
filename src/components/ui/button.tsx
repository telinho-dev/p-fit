import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-flame) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-(--color-ink) text-(--color-bg) hover:bg-white",
        flame: "bg-(--color-flame) text-(--color-ink) hover:bg-(--color-flame-2)",
        lime: "bg-(--color-lime) text-(--color-bg) hover:bg-(--color-lime-2)",
        secondary: "bg-(--color-panel-2) text-(--color-ink) border border-(--color-line) hover:bg-(--color-panel-3)",
        ghost: "bg-transparent text-(--color-ink-dim) hover:text-(--color-ink) hover:bg-(--color-panel-2)",
        danger: "bg-(--color-rose-soft) text-(--color-rose) hover:bg-(--color-rose) hover:text-(--color-ink)",
      },
      size: {
        sm: "h-8 px-3.5 text-[12px]",
        md: "h-10 px-5 text-[13px]",
        lg: "h-12 px-6 text-[14px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
