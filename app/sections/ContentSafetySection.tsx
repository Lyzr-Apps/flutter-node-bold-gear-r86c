'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RiShieldCheckLine, RiSearchLine, RiAlertLine, RiCheckLine, RiCloseLine, RiArrowRightLine, RiHistoryLine, RiShieldLine, RiInformationLine } from 'react-icons/ri'

interface RiskFactor {
  factor: string
  severity: string
  description: string
}
interface SafetyRecommendation {
  action: string
  description: string
}
interface SaferAlternative {
  name: string
  reason: string
}
interface SafetyResult {
  content_evaluated?: string
  safety_rating?: string
  age_suitability?: string
  risk_factors?: RiskFactor[]
  detailed_reasoning?: string
  recommendations?: SafetyRecommendation[]
  safer_alternatives?: SaferAlternative[]
}

interface HistoryEntry {
  query: string
  result: SafetyResult
  timestamp: string
}

interface ContentSafetySectionProps {
  safetyResult: SafetyResult | null
  safetyLoading: boolean
  safetyError: string | null
  onEvaluate: (query: string) => void
  showSample: boolean
}

const SAMPLE_RESULT: SafetyResult = {
  content_evaluated: "Roblox",
  safety_rating: "Caution",
  age_suitability: "Ages 10+ with parental supervision",
  risk_factors: [
    { factor: "User-Generated Content", severity: "medium", description: "Players can create and share content that may not be moderated in real-time." },
    { factor: "In-Game Chat", severity: "high", description: "Open chat with strangers poses potential communication risks." },
    { factor: "In-App Purchases", severity: "medium", description: "Virtual currency (Robux) can lead to unintended spending." }
  ],
  detailed_reasoning: "Roblox is a popular gaming platform that offers creative and social experiences. However, due to user-generated content and open chat features, parental oversight is recommended. The platform has built-in safety features like chat filters and parental controls, but they are not foolproof.",
  recommendations: [
    { action: "Enable Account Restrictions", description: "Turn on Account Restrictions in Roblox settings to limit chat and content access." },
    { action: "Set Spending Limits", description: "Configure parental controls to prevent unauthorized Robux purchases." },
    { action: "Review Friends List", description: "Regularly check your child's friends list and interactions." }
  ],
  safer_alternatives: [
    { name: "Minecraft Education Edition", reason: "Similar creative gameplay with curated educational content and no open chat." },
    { name: "Toca Life World", reason: "Age-appropriate sandbox game with no online interaction." }
  ]
}

function safetyRatingStyle(rating: string) {
  const r = (rating ?? '').toLowerCase()
  if (r.includes('safe') && !r.includes('caution') && !r.includes('unsafe')) return { bg: 'bg-primary/10 border-primary/20', text: 'text-primary', badge: 'bg-primary text-primary-foreground', icon: RiCheckLine }
  if (r.includes('caution') || r.includes('moderate')) return { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-700', badge: 'bg-yellow-500 text-white', icon: RiAlertLine }
  if (r.includes('block') || r.includes('unsafe') || r.includes('danger')) return { bg: 'bg-destructive/10 border-destructive/20', text: 'text-destructive', badge: 'bg-destructive text-destructive-foreground', icon: RiCloseLine }
  return { bg: 'bg-secondary border-border', text: 'text-foreground', badge: 'bg-secondary text-secondary-foreground', icon: RiShieldLine }
}

function severityBadge(severity: string) {
  const s = (severity ?? '').toLowerCase()
  if (s === 'high' || s === 'critical') return 'bg-destructive/10 text-destructive border-destructive/20'
  if (s === 'medium' || s === 'moderate') return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
  return 'bg-primary/10 text-primary border-primary/20'
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
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{line}</p>
      })}
    </div>
  )
}

export default function ContentSafetySection({
  safetyResult,
  safetyLoading,
  safetyError,
  onEvaluate,
  showSample
}: ContentSafetySectionProps) {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const displayResult = showSample ? SAMPLE_RESULT : safetyResult

  const handleEvaluate = () => {
    if (!query.trim()) return
    onEvaluate(query.trim())
    setQuery('')
  }

  // Track history when new result arrives
  React.useEffect(() => {
    if (safetyResult && safetyResult.content_evaluated) {
      setHistory(prev => [{
        query: safetyResult.content_evaluated ?? '',
        result: safetyResult,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10))
    }
  }, [safetyResult])

  const rating = safetyRatingStyle(displayResult?.safety_rating ?? '')
  const RatingIcon = rating.icon

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Search Input */}
      <Card className="glass-card rounded-[0.875rem]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <RiShieldCheckLine className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold tracking-[-0.01em]">Content Safety Check</h3>
            </div>
            <p className="text-xs text-muted-foreground tracking-[-0.01em]">Enter a URL, app name, or content snippet to evaluate for child safety.</p>
            <div className="flex gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a URL, app name, or content to evaluate..."
                className="rounded-[0.75rem] h-11 tracking-[-0.01em]"
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
              />
              <Button
                onClick={handleEvaluate}
                disabled={safetyLoading || !query.trim()}
                className="rounded-[0.875rem] px-6 h-11 font-medium tracking-[-0.01em]"
              >
                {safetyLoading ? (
                  <RiSearchLine className="w-4 h-4 animate-spin" />
                ) : (
                  <><RiSearchLine className="w-4 h-4 mr-2" /> Evaluate</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {safetyError && (
        <div className="p-4 rounded-[0.875rem] bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {safetyError}
          <Button variant="ghost" size="sm" className="ml-2 text-destructive" onClick={() => onEvaluate(query)}>Retry</Button>
        </div>
      )}

      {/* Loading */}
      {safetyLoading && (
        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {displayResult && !safetyLoading && (
        <Card className={cn("rounded-[0.875rem] border-2 transition-all", rating.bg)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", rating.badge)}>
                  <RatingIcon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold tracking-[-0.01em]">
                    {displayResult?.content_evaluated ?? 'Content'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Safety Evaluation Result</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-sm px-3 py-1", rating.badge)}>
                  {displayResult?.safety_rating ?? 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            {/* Age Suitability */}
            {displayResult?.age_suitability && (
              <div className="flex items-center gap-2 p-3 rounded-[0.75rem] bg-background/50">
                <RiInformationLine className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm tracking-[-0.01em]"><span className="font-medium">Age Suitability:</span> {displayResult.age_suitability}</span>
              </div>
            )}

            {/* Risk Factors */}
            {Array.isArray(displayResult?.risk_factors) && displayResult.risk_factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold tracking-[-0.01em] flex items-center gap-2">
                  <RiAlertLine className="w-4 h-4" /> Risk Factors
                </h4>
                <div className="space-y-2">
                  {displayResult.risk_factors.map((rf, i) => (
                    <div key={i} className={cn("p-3 rounded-[0.75rem] border", severityBadge(rf?.severity ?? ''))}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{rf?.factor ?? ''}</span>
                        <Badge variant="outline" className="text-xs capitalize">{rf?.severity ?? ''}</Badge>
                      </div>
                      <p className="text-xs opacity-80">{rf?.description ?? ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Reasoning */}
            {displayResult?.detailed_reasoning && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold tracking-[-0.01em]">Detailed Analysis</h4>
                <div className="p-4 rounded-[0.75rem] bg-background/50">
                  {renderMarkdown(displayResult.detailed_reasoning)}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {Array.isArray(displayResult?.recommendations) && displayResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold tracking-[-0.01em]">Recommendations</h4>
                <div className="space-y-2">
                  {displayResult.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-[0.75rem] bg-background/50">
                      <RiArrowRightLine className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium tracking-[-0.01em]">{rec?.action ?? ''}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec?.description ?? ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safer Alternatives */}
            {Array.isArray(displayResult?.safer_alternatives) && displayResult.safer_alternatives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold tracking-[-0.01em] flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-primary" /> Safer Alternatives
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayResult.safer_alternatives.map((alt, i) => (
                    <Card key={i} className="rounded-[0.75rem] bg-primary/5 border-primary/10">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium tracking-[-0.01em]">{alt?.name ?? ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alt?.reason ?? ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!displayResult && !safetyLoading && !safetyError && (
        <Card className="glass-card rounded-[0.875rem]">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <RiShieldCheckLine className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold tracking-[-0.01em] mb-2">Check Content Safety</h3>
            <p className="text-sm text-muted-foreground max-w-sm tracking-[-0.01em]">
              Enter a website URL, app name, or paste content above to get an AI-powered safety evaluation for your child.
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="glass-card rounded-[0.875rem]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-[-0.01em] flex items-center gap-2">
              <RiHistoryLine className="w-4 h-4 text-muted-foreground" /> Recent Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {history.map((h, i) => {
                const hStyle = safetyRatingStyle(h?.result?.safety_rating ?? '')
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-[0.75rem] bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => {}}>
                    <Badge className={cn("text-xs shrink-0", hStyle.badge)}>{h?.result?.safety_rating ?? '?'}</Badge>
                    <span className="text-sm font-medium tracking-[-0.01em] truncate">{h?.query ?? ''}</span>
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{h?.timestamp ?? ''}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
