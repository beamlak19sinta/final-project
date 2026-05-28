import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const SidebarContext = React.createContext(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.")
    }
    return context
}

const SidebarProvider = React.forwardRef(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref
    ) => {
        const [open, setOpen] = React.useState(defaultOpen)

        const _open = openProp ?? open
        const setOpenInternal = React.useCallback(
            (value) => {
                if (setOpenProp) {
                    return setOpenProp(typeof value === "function" ? value(_open) : value)
                }
                setOpen(value)
            },
            [setOpenProp, _open]
        )

        const toggleSidebar = React.useCallback(() => {
            return setOpenInternal((prev) => !prev)
        }, [setOpenInternal])

        const state = _open ? "expanded" : "collapsed"

        const contextValue = React.useMemo(
            () => ({
                state,
                open: _open,
                setOpen,
                toggleSidebar,
            }),
            [state, _open, setOpen, toggleSidebar]
        )

        return (
            <SidebarContext.Provider value={contextValue}>
                <div
                    style={{
                        "--sidebar-width": "18rem",
                        "--sidebar-width-icon": "3rem",
                        ...style,
                    }}
                    className={cn(
                        "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </SidebarContext.Provider>
        )
    }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef(
    (
        {
            side = "left",
            variant = "sidebar",
            collapsible = "offcanvas",
            className,
            children,
            ...props
        },
        ref
    ) => {
        const { state } = useSidebar()

        if (collapsible === "none") {
            return (
                <div
                    className={cn(
                        "flex h-full w-sidebar-width flex-col bg-sidebar text-sidebar-foreground",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            )
        }

        return (
            <aside
                ref={ref}
                className={cn(
                    "group peer flex flex-col h-screen bg-sidebar text-sidebar-foreground shrink-0 transition-all duration-200 ease-linear border-r border-sidebar-border",
                    "w-sidebar-width data-[state=collapsed]:w-sidebar-width-icon",
                    "hidden md:flex",
                    variant === "floating" && "m-2 rounded-lg border shadow",
                    variant === "inset" && "m-2 rounded-2xl border shadow-xl",
                    className
                )}
                data-state={state}
                data-collapsible={state === "collapsed" ? collapsible : ""}
                data-variant={variant}
                data-side={side}
                {...props}
            >
                {children}
            </aside>
        )
    }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            ref={ref}
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", className)}
            onClick={(event) => {
                onClick?.(event)
                toggleSidebar()
            }}
            {...props}
        >
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="header"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
    />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="footer"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
    />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="content"
        className={cn(
            "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
            className
        )}
        {...props}
    />
))
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group"
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
    />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"

    return (
        <Comp
            ref={ref}
            data-sidebar="group-label"
            className={cn(
                "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-black text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opaicty] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-ml-8 group-data-[collapsible=icon]:opacity-0",
                className
            )}
            {...props}
        />
    )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu"
        className={cn("flex w-full min-w-0 flex-col gap-1", className)}
        {...props}
    />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-sidebar="menu-item"
        className={cn("group/menu-item relative", className)}
        {...props}
    />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(
    (
        {
            asChild = false,
            isActive = false,
            size = "default",
            className,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                ref={ref}
                data-sidebar="menu-button"
                data-size={size}
                data-active={isActive}
                className={cn(
                    "peer flex w-full items-center gap-4 overflow-hidden rounded-xl p-3 text-left text-sm font-bold outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-black group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-2 [&>svg]:size-5 [&>svg]:shrink-0",
                    className
                )}
                {...props}
            />
        )
    }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <main
            ref={ref}
            className={cn(
                "flex flex-1 flex-col min-h-screen bg-background",
                className
            )}
            {...props}
        />
    )
})
SidebarInset.displayName = "SidebarInset"

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
    useSidebar,
}
