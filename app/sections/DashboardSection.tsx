'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RiTimeLine, RiBarChartLine, RiAppsLine, RiAlertLine, RiArrowUpLine, RiArrowDownLine, RiLineChartLine, RiStarLine, RiLightbulbLine, RiRefreshLine } from 'react-icons/ri'

// Types
interface KeyPattern {
  pattern: string
  severity: string
  description: string
}
interface Trend {
  metric: string
  direction: string
  details: string
}
interface Recommendation {
  title: string
  description: string
  priority: string
}
interface AlertItem {
  type: string
  message: string
  severity: string
}
interface InsightsData {
  summary?: string
  key_patterns?: KeyPattern[]
  trends?: Trend[]
  recommendations?: Recommendation[]
  alerts?: AlertItem[]
  screen_time_score?: string
  overall_assessment?: string
}

interface ChildProfile {
  name: string
  age: number
  screenTimeToday: string
  weeklyAvg: string
  topApps: { name: string; time: string }[]
  alertCount: number
  sessions: { app: string; duration: string; time: string }[]
}

interface DashboardSectionProps {
  selectedChild: number
  setSelectedChild: (i: number) => void
  children_profiles: ChildProfile[]
  insights: InsightsData | null
  insightsLoading: boolean
  insightsError: string | null
  onGenerateInsights: () => void
  showSample: boolean
}

const SAMPLE_INSIGHTS: InsightsData = {
  summary: "Emma shows a balanced digital usage pattern with a healthy mix of educational and entertainment content. However, there are some late-night usage sessions that need attention.",
  key_patterns: [
    { pattern: "Late Night Usage", severity: "high", description: "Screen activity detected after 9 PM bedtime on 2 occasions this week." },
    { pattern: "Educational Engagement", severity: "low", description: "30 minutes daily on Khan Academy shows good learning habits." },
    { pattern: "Gaming Duration", severity: "medium", description: "Minecraft sessions averaging 75 minutes may benefit from scheduled breaks." }
  ],
  trends: [
    { metric: "Daily Screen Time", direction: "up", details: "Increased 15% compared to last week" },
    { metric: "Educational App Usage", direction: "up", details: "Khan Academy usage up 20% this month" },
    { metric: "Social Media", direction: "stable", details: "No social media accounts active" }
  ],
  recommendations: [
    { title: "Set Bedtime Lock", description: "Enable automatic device lock at 9 PM to prevent late-night usage.", priority: "high" },
    { title: "Add Break Reminders", description: "Configure 15-minute break reminders for gaming sessions over 45 minutes.", priority: "medium" },
    { title: "Reward Learning Time", description: "Consider gamifying educational app usage with small rewards.", priority: "low" }
  ],
  alerts: [
    { type: "Bedtime Violation", message: "Device used at 9:45 PM on Tuesday", severity: "high" },
    { type: "Extended Session", message: "Minecraft session exceeded 90 minutes on Wednesday", severity: "medium" }
  ],
  screen_time_score: "7.2/10",
  overall_assessment: "Overall, Emma's digital habits are developing well. The primary concern is occasional bedtime violations. Educational content consumption is above average for her age group. Recommend implementing stricter bedtime controls while maintaining the positive educational engagement."
}

function severityColor(severity: string) {
  const s = severity?.toLowerCase() ?? ''
  if (s === 'high' || s === 'critical') return 'bg-destructive/10 text-destructive border-destructive/20'
  if (s === 'medium' || s === 'moderate') return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
  return 'bg-primary/10 text-primary border-primary/20'
}

function priorityColor(priority: string) {
  const p = priority?.toLowerCase() ?? ''
  if (p === 'high') return 'bg-destructive text-destructive-foreground'
  if (p === 'medium') return 'bg-yellow-500 text-white'
  return 'bg-primary text-primary-foreground'
}

function CircularProgress({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-700" />
        <text x="50" y="48" textAnchor="middle" className="fill-foreground text-lg font-semibold" style={{ fontSize: '16px' }}>{label}</text>
        <text x="50" y="64" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '10px' }}>today</text>
      </svg>
    </div>
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{line.slice(2)}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\.\s/, '')}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{line}</p>
      })}
    </div>
  )
}

export default function DashboardSection({
  selectedChild,
  setSelectedChild,
  children_profiles,
  insights,
  insightsLoading,
  insightsError,
  onGenerateInsights,
  showSample
}: DashboardSectionProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false)
  const child = children_profiles[selectedChild]
  const displayInsights = showSample ? SAMPLE_INSIGHTS : insights
  const showInsightsPanel = showSample || displayInsights

  const formatScreenTime = (val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return val
    const hours = Math.floor(num)
    const mins = Math.round((num - hours) * 60)
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Child Selector */}
      <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-[0.875rem] w-fit">
        {children_profiles.map((c, i) => (
          <button
            key={i}
            onClick={() => setSelectedChild(i)}
            className={cn(
              "px-4 py-2 rounded-[0.75rem] text-sm font-medium transition-all duration-200",
              selectedChild === i
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {c.name}, {c.age}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-5 flex flex-col items-center">
            <CircularProgress value={parseFloat(child?.screenTimeToday ?? '0')} max={8} label={formatScreenTime(child?.screenTimeToday ?? '0')} />
            <p className="text-xs text-muted-foreground mt-1 tracking-[-0.01em]">Screen Time Today</p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-5 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <RiBarChartLine className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-semibold tracking-[-0.01em]">{child?.weeklyAvg ?? '--'}</span>
            <p className="text-xs text-muted-foreground tracking-[-0.01em]">Weekly Average</p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <RiAppsLine className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium tracking-[-0.01em]">Top Apps</span>
            </div>
            <div className="space-y-2">
              {Array.isArray(child?.topApps) && child.topApps.map((app, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="truncate font-medium tracking-[-0.01em]">{app?.name ?? ''}</span>
                  <span className="text-muted-foreground text-xs ml-2">{app?.time ?? ''}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-5 flex flex-col items-center gap-2">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", (child?.alertCount ?? 0) > 0 ? "bg-destructive/10" : "bg-primary/10")}>
              <RiAlertLine className={cn("w-6 h-6", (child?.alertCount ?? 0) > 0 ? "text-destructive" : "text-primary")} />
            </div>
            <span className="text-2xl font-semibold tracking-[-0.01em]">{child?.alertCount ?? 0}</span>
            <p className="text-xs text-muted-foreground tracking-[-0.01em]">Active Alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="glass-card rounded-[0.875rem]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold tracking-[-0.01em] flex items-center gap-2">
            <RiTimeLine className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Array.isArray(child?.sessions) && child.sessions.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-[0.75rem] bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <RiAppsLine className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium tracking-[-0.01em] truncate">{s?.app ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{s?.time ?? ''}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">{s?.duration ?? ''}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Insights Button */}
      <div className="flex gap-3">
        <Button
          onClick={onGenerateInsights}
          disabled={insightsLoading}
          className="rounded-[0.875rem] px-6 py-3 font-medium tracking-[-0.01em]"
        >
          {insightsLoading ? (
            <><RiRefreshLine className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><RiLightbulbLine className="w-4 h-4 mr-2" /> Generate Insights</>
          )}
        </Button>
      </div>

      {insightsError && (
        <div className="p-4 rounded-[0.875rem] bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {insightsError}
          <Button variant="ghost" size="sm" onClick={onGenerateInsights} className="ml-2 text-destructive">Retry</Button>
        </div>
      )}

      {/* Insights Loading */}
      {insightsLoading && (
        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Panel */}
      {showInsightsPanel && !insightsLoading && (
        <Card className="glass-card rounded-[0.875rem] border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold tracking-[-0.01em] flex items-center gap-2">
                <RiLineChartLine className="w-5 h-5 text-primary" />
                Activity Insights
              </CardTitle>
              <div className="flex items-center gap-3">
                {displayInsights?.screen_time_score && (
                  <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                    <RiStarLine className="w-4 h-4 mr-1" />
                    Score: {displayInsights.screen_time_score}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => setInsightsExpanded(!insightsExpanded)} className="text-xs">
                  {insightsExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            {/* Summary */}
            {displayInsights?.summary && (
              <div className="p-4 rounded-[0.75rem] bg-primary/5 border border-primary/10">
                {renderMarkdown(displayInsights.summary)}
              </div>
            )}

            {/* Alerts */}
            {Array.isArray(displayInsights?.alerts) && displayInsights.alerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold tracking-[-0.01em] flex items-center gap-2">
                  <RiAlertLine className="w-4 h-4 text-destructive" /> Alerts
                </h4>
                {displayInsights.alerts.map((a, i) => (
                  <div key={i} className={cn("p-3 rounded-[0.75rem] border text-sm", severityColor(a?.severity ?? ''))}>
                    <span className="font-medium">{a?.type ?? 'Alert'}:</span> {a?.message ?? ''}
                  </div>
                ))}
              </div>
            )}

            {/* Key Patterns */}
            {Array.isArray(displayInsights?.key_patterns) && displayInsights.key_patterns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold tracking-[-0.01em]">Key Patterns</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {displayInsights.key_patterns.map((p, i) => (
                    <div key={i} className={cn("p-4 rounded-[0.75rem] border", severityColor(p?.severity ?? ''))}>
                      <p className="font-medium text-sm mb-1">{p?.pattern ?? ''}</p>
                      <p className="text-xs opacity-80">{p?.description ?? ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insightsExpanded && (
              <>
                {/* Trends */}
                {Array.isArray(displayInsights?.trends) && displayInsights.trends.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold tracking-[-0.01em]">Trends</h4>
                    <div className="space-y-2">
                      {displayInsights.trends.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-[0.75rem] bg-secondary/30">
                          {(t?.direction ?? '').toLowerCase() === 'up' ? (
                            <RiArrowUpLine className="w-5 h-5 text-yellow-600 shrink-0" />
                          ) : (t?.direction ?? '').toLowerCase() === 'down' ? (
                            <RiArrowDownLine className="w-5 h-5 text-primary shrink-0" />
                          ) : (
                            <RiLineChartLine className="w-5 h-5 text-muted-foreground shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium tracking-[-0.01em]">{t?.metric ?? ''}</p>
                            <p className="text-xs text-muted-foreground">{t?.details ?? ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {Array.isArray(displayInsights?.recommendations) && displayInsights.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold tracking-[-0.01em]">Recommendations</h4>
                    <div className="space-y-2">
                      {displayInsights.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-[0.75rem] bg-secondary/30">
                          <Badge className={cn("shrink-0 text-xs mt-0.5", priorityColor(r?.priority ?? ''))}>{r?.priority ?? 'low'}</Badge>
                          <div>
                            <p className="text-sm font-medium tracking-[-0.01em]">{r?.title ?? ''}</p>
                            <p className="text-xs text-muted-foreground mt-1">{r?.description ?? ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overall Assessment */}
                {displayInsights?.overall_assessment && (
                  <div className="p-4 rounded-[0.75rem] bg-accent/5 border border-accent/10">
                    <h4 className="text-sm font-semibold tracking-[-0.01em] mb-2">Overall Assessment</h4>
                    {renderMarkdown(displayInsights.overall_assessment)}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
