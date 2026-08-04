"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export type BranchFlowTone = "primary" | "success" | "warning" | "destructive" | "muted" | "accent"

export type BranchFlowNode = {
  id: string
  label: string
  value: number
  amount?: number
  tone: BranchFlowTone
  children?: string[]
  hint?: string
}

type FlowEdge = {
  from: string
  to: string
  value: number
}

type FlowPath = {
  key: string
  d: string
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
}

const toneDotClass: Record<BranchFlowTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground",
  accent: "bg-chart-4",
}

const connectorColor = "var(--color-primary)"

function collectDescendants(nodeId: string, nodeMap: Map<string, BranchFlowNode>, acc = new Set<string>()) {
  const node = nodeMap.get(nodeId)
  if (!node?.children?.length) return acc
  node.children.forEach((childId) => {
    if (acc.has(childId)) return
    acc.add(childId)
    collectDescendants(childId, nodeMap, acc)
  })
  return acc
}

export function TransactionStateBranchFlow({
  rootId,
  nodes,
  initialExpandedNodeIds,
  className,
}: {
  rootId: string
  nodes: BranchFlowNode[]
  initialExpandedNodeIds?: string[]
  className?: string
}) {
  const formatInr = (value: number) => `₹${Math.max(0, Math.round(value)).toLocaleString("en-MY")}`
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    () => new Set(initialExpandedNodeIds?.length ? initialExpandedNodeIds : [rootId])
  )
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [paths, setPaths] = useState<FlowPath[]>([])

  useEffect(() => {
    setExpandedNodes(new Set(initialExpandedNodeIds?.length ? initialExpandedNodeIds : [rootId]))
  }, [initialExpandedNodeIds, rootId])

  const { columns, edges, rootValue } = useMemo(() => {
    const levels = new Map<string, number>()
    const queue: string[] = [rootId]
    levels.set(rootId, 0)
    const visibleEdges: FlowEdge[] = []

    while (queue.length > 0) {
      const currentId = queue.shift()
      if (!currentId) continue
      const currentLevel = levels.get(currentId) ?? 0
      const node = nodeMap.get(currentId)
      if (!node?.children?.length) continue
      if (!expandedNodes.has(currentId)) continue

      node.children.forEach((childId) => {
        if (!nodeMap.has(childId)) return
        if (!levels.has(childId)) {
          levels.set(childId, currentLevel + 1)
          queue.push(childId)
        }
        const childNode = nodeMap.get(childId)
        visibleEdges.push({
          from: currentId,
          to: childId,
          value: childNode?.value ?? 0,
        })
      })
    }

    const grouped: Record<number, BranchFlowNode[]> = {}
    levels.forEach((level, nodeId) => {
      if (!grouped[level]) grouped[level] = []
      const node = nodeMap.get(nodeId)
      if (node) grouped[level].push(node)
    })

    const orderedColumns = Object.keys(grouped)
      .map((level) => Number(level))
      .sort((a, b) => a - b)
      .map((level) =>
        grouped[level].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
      )

    return {
      columns: orderedColumns,
      edges: visibleEdges,
      rootValue: nodeMap.get(rootId)?.value ?? 0,
    }
  }, [expandedNodes, nodeMap, rootId])

  const recalculatePaths = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      setPaths([])
      return
    }

    const containerRect = container.getBoundingClientRect()
    const nextPaths: FlowPath[] = []

    edges.forEach((edge) => {
      const fromEl = nodeRefs.current[edge.from]
      const toEl = nodeRefs.current[edge.to]
      if (!fromEl || !toEl) return

      const fromRect = fromEl.getBoundingClientRect()
      const toRect = toEl.getBoundingClientRect()
      const startX = fromRect.right - containerRect.left
      const startY = fromRect.top - containerRect.top + fromRect.height / 2
      const endX = toRect.left - containerRect.left
      const endY = toRect.top - containerRect.top + toRect.height / 2
      const curve = Math.max(34, (endX - startX) * 0.45)
      const d = `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`
      nextPaths.push({
        key: `${edge.from}->${edge.to}`,
        d,
        startX,
        startY,
        endX,
        endY,
        color: connectorColor,
      })
    })

    setPaths(nextPaths)
  }, [edges, nodeMap])

  const connectorDots = useMemo(() => {
    const dots = new Map<string, { x: number; y: number; color: string }>()
    paths.forEach((path) => {
      const startKey = `${Math.round(path.startX)}-${Math.round(path.startY)}-s`
      const endKey = `${Math.round(path.endX)}-${Math.round(path.endY)}-e`
      if (!dots.has(startKey)) {
        dots.set(startKey, { x: path.startX, y: path.startY, color: connectorColor })
      }
      if (!dots.has(endKey)) {
        dots.set(endKey, { x: path.endX, y: path.endY, color: connectorColor })
      }
    })
    return Array.from(dots.entries()).map(([key, dot]) => ({ key, ...dot }))
  }, [paths])

  useEffect(() => {
    const frame = requestAnimationFrame(recalculatePaths)
    const onResize = () => recalculatePaths()
    window.addEventListener("resize", onResize)

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => recalculatePaths()) : null
    if (observer && containerRef.current) observer.observe(containerRef.current)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onResize)
      observer?.disconnect()
    }
  }, [recalculatePaths])

  const toggleNode = (nodeId: string) => {
    const node = nodeMap.get(nodeId)
    if (!node?.children?.length) return

    setExpandedNodes((current) => {
      const next = new Set(current)
      if (next.has(nodeId)) {
        next.delete(nodeId)
        collectDescendants(nodeId, nodeMap).forEach((childId) => next.delete(childId))
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  return (
    <div className={cn("relative overflow-x-auto", className)} ref={containerRef}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {paths.map((path) => (
          <path
            key={path.key}
            d={path.d}
            fill="none"
            stroke={path.color}
            strokeWidth={1.7}
            strokeOpacity={0.38}
            strokeLinecap="round"
          />
        ))}
        {connectorDots.map((dot) => (
          <circle
            key={dot.key}
            cx={dot.x}
            cy={dot.y}
            r={3.2}
            fill={dot.color}
            stroke="var(--color-card)"
            strokeWidth={1.2}
            opacity={0.95}
          />
        ))}
      </svg>

      <div className="relative z-10 flex min-w-max items-start gap-12 px-6 py-5">
        {columns.map((column, columnIndex) => (
          <div key={`column-${columnIndex}`} className="flex w-[280px] flex-col gap-4">
            {column.map((node) => {
              const hasChildren = Boolean(node.children?.length)
              const isExpanded = expandedNodes.has(node.id)
              const percentage = rootValue > 0 ? ((node.value / rootValue) * 100).toFixed(node.id === rootId ? 0 : 1) : "0"
              const ExpandIcon = isExpanded ? Minus : Plus

              return (
                <button
                  key={node.id}
                  ref={(element) => {
                    nodeRefs.current[node.id] = element
                  }}
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className={cn(
                    "relative w-full rounded-xl border border-border/70 bg-card/95 px-3.5 py-3 text-left shadow-sm transition-all",
                    hasChildren ? "cursor-pointer hover:border-primary/35 hover:bg-card" : "cursor-default",
                    hasChildren && isExpanded ? "ring-1 ring-primary/35" : "",
                    !hasChildren ? "opacity-95" : ""
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", toneDotClass[node.tone])} />
                          <p className="truncate text-[13px] font-medium text-foreground">{node.label}</p>
                        </div>
                        {node.hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{node.hint}</p> : null}
                      </div>
                      {hasChildren ? (
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/70 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"
                          )}
                        >
                          <ExpandIcon className="h-3 w-3" />
                          {isExpanded ? "Collapse" : "Expand"}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[20px] font-semibold leading-none text-foreground">
                          {node.value.toLocaleString("en-MY")} txns
                        </p>
                        {typeof node.amount === "number" ? (
                          <p className="text-[12px] font-medium text-muted-foreground">{formatInr(node.amount)}</p>
                        ) : null}
                      </div>
                      <span className="rounded-md border border-border/70 bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
