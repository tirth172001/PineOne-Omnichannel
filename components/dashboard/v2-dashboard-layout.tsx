"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Headphones } from "lucide-react"
import { isDummyAuthenticated } from "@/lib/dummy-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/navigation/routes"
import {
  inferSidebarProductFromPathname,
  type SidebarProduct,
} from "@/lib/navigation/navigation-model"
import { BottomNav } from "./bottom-nav"
import { NavVisibilityProvider } from "./nav-visibility-context"
import { FloatingDemoFab } from "./floating-demo-fab"
import { useDemoSettingsState } from "./use-demo-settings"
import { V2ProductRail } from "./v2-product-rail"
import { V2Sidebar, V2SidebarMobile } from "./v2-sidebar"
import { V2SupportDrawer } from "./v2-support-drawer"
import { V2Topbar } from "./v2-topbar"

interface V2DashboardLayoutProps {
  children: React.ReactNode
}

function ProductComingSoon({
  product,
}: {
  product: SidebarProduct
}) {
  const title = product === "cards" ? "Cards" : product === "fintech-apis" ? "Fintech APIs" : "Product"

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-4xl items-center justify-center px-6 py-12">
      <section className="w-full max-w-xl space-y-4 rounded-xl border border-border/70 bg-card/40 p-8 text-center">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
          Coming soon
        </Badge>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          This workspace is under active development. Use the left navigation to preview planned sections.
        </p>
      </section>
    </div>
  )
}

export function V2DashboardLayout({ children }: V2DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const settings = useDemoSettingsState()
  const centerMaxWidth = settings.maxWidth === "custom" ? settings.customMaxWidth : settings.maxWidth
  const [authReady, setAuthReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState<SidebarProduct>(() =>
    inferSidebarProductFromPathname(pathname)
  )
  const isMobile = useIsMobile()

  const productDefaultRoute: Record<SidebarProduct, string> = {
    payments: ROUTES.home,
    "cross-border": ROUTES.crossBorder.root,
    cards: ROUTES.products.giftCardsComingSoon,
    "fintech-apis": ROUTES.products.fintechApisComingSoon,
  }

  const handleProductChange = (product: SidebarProduct) => {
    setActiveProduct(product)
    if (inferSidebarProductFromPathname(pathname) !== product) {
      router.push(productDefaultRoute[product])
    }
  }

  useEffect(() => {
    const inferred = inferSidebarProductFromPathname(pathname)
    setActiveProduct(inferred)
  }, [pathname])

  useEffect(() => {
    const isAuthenticated = isDummyAuthenticated()
    setAuthenticated(isAuthenticated)
    setAuthReady(true)
    if (!isAuthenticated) {
      router.replace(ROUTES.login)
    }
  }, [pathname, router])

  if (!authReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace…
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <NavVisibilityProvider>
    <div className="relative flex min-h-screen flex-col bg-background">
      <V2Topbar pathname={pathname} onMenuClick={() => setMobileNavOpen(true)} isMobile={isMobile} />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <V2ProductRail activeProduct={activeProduct} onProductChange={handleProductChange} />
        <V2Sidebar product={activeProduct} />
        <div className="min-w-0 flex flex-1 flex-col">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={pathname}
              className="flex flex-1 flex-col pb-20 md:pb-0"
              style={
                {
                  "--dashboard-center-max-width": `${centerMaxWidth}px`,
                  "--dashboard-top-offset": "56px",
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeProduct === "cards" || activeProduct === "fintech-apis" ? (
                <ProductComingSoon product={activeProduct} />
              ) : (
                children
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Button
        type="button"
        aria-label="Help and support"
        className={cn(
          "group fixed right-5 z-40 h-10 rounded-md shadow-lg transition-all duration-200 ease-out overflow-hidden",
          isMobile ? "bottom-20" : "bottom-5",
          "w-10 justify-start p-0 gap-0 hover:w-40 hover:gap-3"
        )}
        onClick={() => setSupportOpen(true)}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          <Headphones className="h-4 w-4" />
        </span>
        <span
          className={cn(
            "whitespace-nowrap text-sm transition-all duration-200 ease-out",
            "w-0 min-w-0 overflow-hidden opacity-0 group-hover:w-[126px] group-hover:pl-0 group-hover:opacity-100"
          )}
        >
          Help & Support
        </span>
      </Button>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          a11yTitle="Navigation menu"
          a11yDescription="Main navigation links for the platform."
          className="w-full border-t border-border/60 bg-sidebar p-0"
        >
          <V2SidebarMobile product={activeProduct} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <BottomNav
        pathname={pathname}
        onMenuClick={() => setMobileNavOpen(true)}
      />
      <FloatingDemoFab />
      <V2SupportDrawer open={supportOpen} onOpenChange={setSupportOpen} pathname={pathname} />
    </div>
    </NavVisibilityProvider>
  )
}
