'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { RiDashboardLine, RiShieldCheckLine, RiRobotLine, RiSettings3Line, RiLeafLine, RiPulseLine } from 'react-icons/ri'

import DashboardSection from './sections/DashboardSection'
import ContentSafetySection from './sections/ContentSafetySection'
import AIAssistantSection from './sections/AIAssistantSection'
import ControlsSection from './sections/ControlsSection'

// --- Agent IDs ---
const ACTIVITY_INSIGHTS_AGENT = '69a2531d7feec6663e53da69'
const CONTENT_SAFETY_AGENT = '69a2531dbac1ad931335b1b4'
const WELLNESS_ADVISOR_AGENT = '69a2531e305bea55e2780a51'

// --- Types ---
interface InsightsData {
  summary?: string
  key_patterns?: { pattern: string; severity: string; description: string }[]
  trends?: { metric: string; direction: string; details: string }[]
  recommendations?: { title: string; description: string; priority: string }[]
  alerts?: { type: string; message: string; severity: string }[]
  screen_time_score?: string
  overall_assessment?: string
}

interface SafetyResult {
  content_evaluated?: string
  safety_rating?: string
  age_suitability?: string
  risk_factors?: { factor: string; severity: string; description: string }[]
  detailed_reasoning?: string
  recommendations?: { action: string; description: string }[]
  safer_alternatives?: { name: string; reason: string }[]
}

interface ChatMessage {
  role: 'user' | 'advisor'
  text: string
  data?: {
    message?: string
    key_points?: { point: string; details: string }[]
    actionable_tips?: { tip: string; implementation: string }[]
    follow_up_questions?: string[]
  }
  timestamp: string
}

// --- Child Profiles ---
const CHILDREN_PROFILES = [
  {
    name: 'Emma',
    age: 8,
    screenTimeToday: '2.75',
    weeklyAvg: '3h',
    topApps: [
      { name: 'YouTube Kids', time: '45m' },
      { name: 'Minecraft', time: '1h 15m' },
      { name: 'Khan Academy', time: '30m' }
    ],
    alertCount: 2,
    sessions: [
      { app: 'YouTube Kids', duration: '45m', time: '9:00 AM - 9:45 AM' },
      { app: 'Minecraft', duration: '1h 15m', time: '2:00 PM - 3:15 PM' },
      { app: 'Khan Academy', duration: '30m', time: '4:00 PM - 4:30 PM' },
      { app: 'Roblox', duration: '15m', time: '5:00 PM - 5:15 PM' }
    ]
  },
  {
    name: 'Liam',
    age: 12,
    screenTimeToday: '3.5',
    weeklyAvg: '4h',
    topApps: [
      { name: 'Fortnite', time: '1h 30m' },
      { name: 'YouTube', time: '1h' },
      { name: 'Duolingo', time: '20m' }
    ],
    alertCount: 1,
    sessions: [
      { app: 'Duolingo', duration: '20m', time: '8:00 AM - 8:20 AM' },
      { app: 'YouTube', duration: '1h', time: '11:00 AM - 12:00 PM' },
      { app: 'Fortnite', duration: '1h 30m', time: '3:00 PM - 4:30 PM' },
      { app: 'WhatsApp', duration: '15m', time: '6:00 PM - 6:15 PM' }
    ]
  }
]

// --- ErrorBoundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Tab Config ---
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { id: 'safety', label: 'Content Safety', icon: RiShieldCheckLine },
  { id: 'assistant', label: 'AI Assistant', icon: RiRobotLine },
  { id: 'controls', label: 'Controls', icon: RiSettings3Line },
] as const

type TabId = typeof TABS[number]['id']

const AGENTS = [
  { id: ACTIVITY_INSIGHTS_AGENT, name: 'Activity Insights Agent', purpose: 'Analyzes screen time and usage patterns' },
  { id: CONTENT_SAFETY_AGENT, name: 'Content Safety Agent', purpose: 'Evaluates content for child safety' },
  { id: WELLNESS_ADVISOR_AGENT, name: 'Digital Wellness Advisor', purpose: 'Provides parenting guidance for digital wellness' },
]

// --- Main Page ---
export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [selectedChild, setSelectedChild] = useState(0)
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)

  const [safetyResult, setSafetyResult] = useState<SafetyResult | null>(null)
  const [safetyLoading, setSafetyLoading] = useState(false)
  const [safetyError, setSafetyError] = useState<string | null>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const handleGenerateInsights = useCallback(async () => {
    const child = CHILDREN_PROFILES[selectedChild]
    if (!child) return
    setInsightsLoading(true)
    setInsightsError(null)
    setActiveAgentId(ACTIVITY_INSIGHTS_AGENT)

    const message = `Analyze the following activity data for ${child.name}, age ${child.age}: Screen time today: ${child.screenTimeToday}h. Weekly average: ${child.weeklyAvg}. Top apps: ${child.topApps.map(a => `${a.name} (${a.time})`).join(', ')}. Recent sessions: ${child.sessions.map(s => `${s.app} ${s.time}`).join(', ')}. Weekend usage tends to be higher at ~4.5h. Bedtime sessions detected twice this week after 9pm.`

    try {
      const result = await callAIAgent(message, ACTIVITY_INSIGHTS_AGENT)
      if (result?.success) {
        const data = result?.response?.result
        setInsights({
          summary: data?.summary ?? '',
          key_patterns: Array.isArray(data?.key_patterns) ? data.key_patterns : [],
          trends: Array.isArray(data?.trends) ? data.trends : [],
          recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
          alerts: Array.isArray(data?.alerts) ? data.alerts : [],
          screen_time_score: data?.screen_time_score ?? '',
          overall_assessment: data?.overall_assessment ?? '',
        })
      } else {
        setInsightsError(result?.error ?? 'Failed to generate insights. Please try again.')
      }
    } catch {
      setInsightsError('Network error. Please check your connection and try again.')
    } finally {
      setInsightsLoading(false)
      setActiveAgentId(null)
    }
  }, [selectedChild])

  const handleEvaluateContent = useCallback(async (query: string) => {
    setSafetyLoading(true)
    setSafetyError(null)
    setActiveAgentId(CONTENT_SAFETY_AGENT)

    try {
      const result = await callAIAgent(query, CONTENT_SAFETY_AGENT)
      if (result?.success) {
        const data = result?.response?.result
        setSafetyResult({
          content_evaluated: data?.content_evaluated ?? query,
          safety_rating: data?.safety_rating ?? '',
          age_suitability: data?.age_suitability ?? '',
          risk_factors: Array.isArray(data?.risk_factors) ? data.risk_factors : [],
          detailed_reasoning: data?.detailed_reasoning ?? '',
          recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
          safer_alternatives: Array.isArray(data?.safer_alternatives) ? data.safer_alternatives : [],
        })
      } else {
        setSafetyError(result?.error ?? 'Failed to evaluate content. Please try again.')
      }
    } catch {
      setSafetyError('Network error. Please check your connection and try again.')
    } finally {
      setSafetyLoading(false)
      setActiveAgentId(null)
    }
  }, [])

  const handleSendMessage = useCallback(async (message: string) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setChatMessages(prev => [...prev, { role: 'user', text: message, timestamp: timeStr }])
    setChatLoading(true)
    setChatError(null)
    setActiveAgentId(WELLNESS_ADVISOR_AGENT)

    try {
      const result = await callAIAgent(message, WELLNESS_ADVISOR_AGENT)
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      if (result?.success) {
        const data = result?.response?.result
        setChatMessages(prev => [...prev, {
          role: 'advisor',
          text: data?.message ?? '',
          data: {
            message: data?.message ?? '',
            key_points: Array.isArray(data?.key_points) ? data.key_points : [],
            actionable_tips: Array.isArray(data?.actionable_tips) ? data.actionable_tips : [],
            follow_up_questions: Array.isArray(data?.follow_up_questions) ? data.follow_up_questions : [],
          },
          timestamp: responseTime
        }])
      } else {
        setChatError(result?.error ?? 'Failed to get response. Please try again.')
      }
    } catch {
      setChatError('Network error. Please check your connection and try again.')
    } finally {
      setChatLoading(false)
      setActiveAgentId(null)
    }
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen gradient-bg text-foreground flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-border/40">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[0.75rem] bg-primary flex items-center justify-center">
                <RiLeafLine className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-[-0.01em]">SmartGuard AI</h1>
                <p className="text-xs text-muted-foreground tracking-[-0.01em] hidden sm:block">Digital parenting made smarter</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tracking-[-0.01em]">Sample Data</span>
                <Switch checked={showSample} onCheckedChange={setShowSample} />
              </div>
            </div>
          </div>

          {/* Desktop Tab Nav */}
          <div className="hidden md:flex max-w-6xl mx-auto px-4 md:px-6 gap-1 pb-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-t-[0.75rem] text-sm font-medium transition-all duration-200 tracking-[-0.01em]",
                    activeTab === tab.id
                      ? "bg-background text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <DashboardSection
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              children_profiles={CHILDREN_PROFILES}
              insights={insights}
              insightsLoading={insightsLoading}
              insightsError={insightsError}
              onGenerateInsights={handleGenerateInsights}
              showSample={showSample}
            />
          )}
          {activeTab === 'safety' && (
            <ContentSafetySection
              safetyResult={safetyResult}
              safetyLoading={safetyLoading}
              safetyError={safetyError}
              onEvaluate={handleEvaluateContent}
              showSample={showSample}
            />
          )}
          {activeTab === 'assistant' && (
            <AIAssistantSection
              chatMessages={chatMessages}
              chatLoading={chatLoading}
              chatError={chatError}
              onSendMessage={handleSendMessage}
              showSample={showSample}
            />
          )}
          {activeTab === 'controls' && (
            <ControlsSection
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              children_profiles={CHILDREN_PROFILES}
            />
          )}
        </main>

        {/* Agent Status */}
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 pb-20 md:pb-6">
          <Card className="glass-card rounded-[0.875rem]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <RiPulseLine className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold tracking-[-0.01em]">AI Agents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {AGENTS.map(agent => (
                  <div key={agent.id} className="flex items-center gap-2 p-2 rounded-[0.5rem] bg-secondary/30">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", activeAgentId === agent.id ? "bg-primary animate-pulse" : "bg-muted-foreground/30")} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium tracking-[-0.01em] truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{agent.purpose}</p>
                    </div>
                    {activeAgentId === agent.id && (
                      <Badge variant="secondary" className="text-[10px] ml-auto shrink-0">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-border/40 z-50">
          <div className="flex items-center justify-around py-2 px-2">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[0.75rem] transition-all duration-200 min-w-[60px]",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", activeTab === tab.id && "scale-110")} />
                  <span className="text-[10px] font-medium tracking-[-0.01em]">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  )
}
