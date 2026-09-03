import type { PillarKey } from '../types'
import { pillarByKey } from '../data/seed'
import { Pill } from './ui'

export function PillarTag({ pillar }: { pillar: PillarKey }) {
  const p = pillarByKey(pillar)
  return <Pill colour={p.colour}>{p.name}</Pill>
}
