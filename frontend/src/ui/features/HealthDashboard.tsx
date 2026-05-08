import React from 'react'
import { Badge } from '@/ui/components/ui/badge'
import { useOdooHealth } from '../hooks/useOdoo'
import type { OdooEnv } from '../../domain/models/OdooEnv'
import { Activity, Globe } from 'lucide-react'

interface HealthDashboardProps {
  envs: OdooEnv[]
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ envs }) => {
  const healthResults = useOdooHealth(envs)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {envs.map((env, i) => {
        const result = healthResults[i]
        const isOnline = result?.data?.status === 'success'
        const isLoading = result?.isLoading

        return (
          <div
            key={env.id}
            className="p-3 border border-hairline bg-surface-soft flex flex-col gap-2 hover:border-ink transition-all"
          >
            <div className="flex items-center justify-between">
              <Globe size={12} className="text-ash" />
              <Badge
                variant={isOnline ? 'success' : 'destructive'}
                className={`text-[8px] font-bold uppercase rounded-none px-1 py-0 ${isLoading ? 'animate-pulse' : ''}`}
              >
                {isLoading ? 'CHECKING' : isOnline ? 'ONLINE' : 'OFFLINE'}
              </Badge>
            </div>
            <div className="truncate text-[10px] font-bold uppercase tracking-tight">
              {env.name}
            </div>
            <div className="flex items-center gap-1">
              <Activity size={10} className={isOnline ? 'text-success' : 'text-danger'} />
              <span className="text-[9px] text-mute font-mono truncate">
                {env.url.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </div>
        )
      })}
      {envs.length === 0 && (
        <div className="col-span-full py-4 text-center border border-dashed border-hairline text-ash text-[10px] font-bold uppercase">
          No environments configured for monitoring
        </div>
      )}
    </div>
  )
}
