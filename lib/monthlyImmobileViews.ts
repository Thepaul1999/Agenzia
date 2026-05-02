import { createAdminClient } from '@/lib/server'

function startOfUtcMonth(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString()
}

/** Conta visite registrate nel mese corrente (UTC) per ogni id. Richiede SERVICE_ROLE. */
export async function countImmobileViewsThisMonthById(
  immobileIds: string[],
): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  if (immobileIds.length === 0) return out
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
      return out
    }
    const admin = createAdminClient()
    const since = startOfUtcMonth()
    const { data, error } = await admin
      .from('immobile_visite_log')
      .select('immobile_id')
      .in('immobile_id', immobileIds)
      .gte('visited_at', since)
    if (error || !data) return out
    for (const row of data) {
      const id = row.immobile_id as string
      out[id] = (out[id] ?? 0) + 1
    }
    return out
  } catch {
    return out
  }
}
