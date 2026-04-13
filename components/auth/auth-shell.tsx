interface AuthShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background p-3 md:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1100px] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm lg:grid-cols-[1.2fr_1fr]">
        <aside className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <img src="/placeholder.jpg" alt="Pine Labs merchants" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        </aside>

        <section className="flex items-center justify-center px-6 py-8 sm:px-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <div className="mb-5 flex items-center gap-2">
                <img src="/brand/pine-labs-icon.ico" alt="Pine Labs icon" className="h-6 w-6 object-contain dark:brightness-0 dark:invert" />
                <span className="text-2xl font-semibold tracking-tight text-foreground">pine labs</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  )
}
