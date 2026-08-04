import { DocsSidebar } from "@/app/component-docs/_components/docs-sidebar"

export default function ComponentDocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <DocsSidebar />
        <main className="min-h-screen px-6 py-8 md:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-[1080px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
