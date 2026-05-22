"use client"

import { SettlementsContent } from "./settlements-content"
import { V3SettlementsContent } from "./v3-settlements-content"

type SettlementsRouteContentProps = {
  batchId?: string
}

export function SettlementsRouteContent({ batchId }: SettlementsRouteContentProps) {
  if (batchId) {
    return <V3SettlementsContent initialBatchId={batchId} />
  }

  return <SettlementsContent />
}
