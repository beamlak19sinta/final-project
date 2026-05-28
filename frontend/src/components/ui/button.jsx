import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-md hover:brightness-110",
                destructive:
                    "bg-red-600 text-white shadow-sm hover:bg-red-700",
                outline:
                    "border-2 border-border bg-transparent shadow-sm hover:bg-secondary hover:text-secondary-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:brightness-95",
                ghost: "hover:bg-accent/10 hover:text-primary",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-14 rounded-2xl px-10 text-base",
                icon: "h-11 w-11 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
