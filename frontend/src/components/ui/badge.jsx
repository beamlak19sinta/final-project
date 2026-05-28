import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow hover:brightness-110",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:brightness-95",
                destructive:
                    "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
                outline: "text-foreground border-border",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
