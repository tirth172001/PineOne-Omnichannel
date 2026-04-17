"use client"

import { V3SettlementsContent } from "./v3-settlements-content"

interface SettlementsRouteContentProps {
  batchId?: string
}

export function SettlementsRouteContent({ batchId }: SettlementsRouteContentProps) {
  return <V3SettlementsContent initialBatchId={batchId} />
}
