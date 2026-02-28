'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { RiRobotLine, RiSendPlaneLine, RiUserLine, RiLightbulbLine, RiQuestionLine, RiArrowRightLine, RiRefreshLine } from 'react-icons/ri'

interface KeyPoint {
  point: string
  details: string
}
interface ActionableTip {
  tip: string
  implementation: string
}
interface AdvisorResponse {
  message?: string
  key_points?: KeyPoint[]
  actionable_tips?: ActionableTip[]
  follow_up_questions?: string[]
}

interface ChatMessage {
  role: 'user' | 'advisor'
  text: string
  data?: AdvisorResponse
  timestamp: string
}

interface AIAssistantSectionProps {
  chatMessages: ChatMessage[]
  chatLoading: boolean
  chatError: string | null
  onSendMessage: (msg: string) => void
  showSample: boolean
}

const SUGGESTED_QUESTIONS = [
  "Is 3 hours of gaming daily too much for a 10-year-old?",
  "How can I manage screen time without constant fights?",
  "What are signs of social media addiction in teens?",
  "Best educational apps for an 8-year-old?",
  "How to set healthy digital boundaries?"
]

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    role: 'user',
    text: 'Is 3 hours of gaming daily too much for a 10-year-old?',
    timestamp: '10:30 AM'
  },
  {
    role: 'advisor',
    text: '',
    data: {
      message: "Three hours of gaming daily for a 10-year-old is above the recommended guidelines. The American Academy of Pediatrics suggests consistent limits on screen time for children, typically recommending no more than 1-2 hours of recreational screen time per day. However, context matters -- the type of games, whether they are educational, and how the child balances gaming with other activities all play a role.",
      key_points: [
        { point: "Recommended Limits", details: "AAP recommends 1-2 hours of recreational screen time for children ages 6-12." },
        { point: "Quality Over Quantity", details: "Educational and creative games (like Minecraft in creative mode) are more beneficial than passive consumption." },
        { point: "Balance is Key", details: "Ensure gaming doesn't replace physical activity, homework, family time, or sleep." }
      ],
      actionable_tips: [
        { tip: "Implement a Timer System", implementation: "Use built-in parental controls to set a 90-minute daily gaming limit with a 15-minute warning before time expires." },
        { tip: "Create a Schedule", implementation: "Designate specific gaming windows (e.g., 4-5:30 PM on weekdays) so your child knows what to expect." },
        { tip: "Earn Extra Time", implementation: "Let your child earn additional gaming minutes through completing chores, reading, or outdoor play." }
      ],
      follow_up_questions: [
        "What types of games does your child play most?",
        "Does your child show resistance when asked to stop gaming?",
        "How does the gaming affect their sleep schedule?"
      ]
    },
    timestamp: '10:31 AM'
  }
]

function renderMarkdown(text: string) {
  if (!text) return null
  const formatInline = (t: string) => {
    const parts = t.split(/\*\*(.*?)\*\*/g)
    if (parts.length === 1) return t
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
    )
  }
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-[1.55]">{formatInline(line)}</p>
      })}
    </div>
  )
}

export default function AIAssistantSection({
  chatMessages,
  chatLoading,
  chatError,
  onSendMessage,
  showSample
}: AIAssistantSectionProps) {
  const [input, setInput] = useState('')
  const [expandedPoints, setExpandedPoints] = useState<Record<number, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayMessages = showSample ? SAMPLE_MESSAGES : chatMessages

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayMessages, chatLoading])

  const handleSend = () => {
    if (!input.trim() || chatLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  const togglePoints = (idx: number) => {
    setExpandedPoints(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] p-4 md:p-6">
      {/* Suggested Questions */}
      {displayMessages.length === 0 && !showSample && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium tracking-[-0.01em]">Suggested questions:</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(q)}
                className="shrink-0 px-4 py-2 rounded-full bg-secondary/60 hover:bg-secondary text-sm text-foreground transition-colors tracking-[-0.01em] border border-border/50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {displayMessages.length === 0 && !showSample && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <RiRobotLine className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold tracking-[-0.01em] mb-2">Digital Wellness Advisor</h3>
            <p className="text-sm text-muted-foreground max-w-sm tracking-[-0.01em]">
              Ask me anything about digital wellness, screen time management, online safety, or parenting in the digital age.
            </p>
          </div>
        )}

        {displayMessages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'advisor' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <RiRobotLine className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn("max-w-[85%] md:max-w-[75%]", msg.role === 'user' ? 'order-first' : '')}>
              {msg.role === 'user' ? (
                <div className="bg-primary text-primary-foreground rounded-[0.875rem] rounded-br-sm px-4 py-3">
                  <p className="text-sm leading-[1.55] tracking-[-0.01em]">{msg.text}</p>
                  <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Main Message */}
                  <div className="bg-secondary/60 rounded-[0.875rem] rounded-bl-sm px-4 py-3 border border-border/30">
                    {renderMarkdown(msg?.data?.message ?? msg.text ?? '')}
                    <p className="text-xs text-muted-foreground mt-2">{msg.timestamp}</p>
                  </div>

                  {/* Key Points */}
                  {Array.isArray(msg?.data?.key_points) && msg.data.key_points.length > 0 && (
                    <Card className="rounded-[0.75rem] border-primary/10 bg-primary/5">
                      <CardContent className="p-3">
                        <button
                          onClick={() => togglePoints(i)}
                          className="flex items-center gap-2 w-full text-left"
                        >
                          <RiLightbulbLine className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-semibold tracking-[-0.01em]">Key Points ({msg.data.key_points.length})</span>
                          <RiArrowRightLine className={cn("w-3 h-3 ml-auto transition-transform text-muted-foreground", expandedPoints[i] && "rotate-90")} />
                        </button>
                        {expandedPoints[i] && (
                          <div className="mt-3 space-y-2">
                            {msg.data.key_points.map((kp, j) => (
                              <div key={j} className="p-2.5 rounded-[0.5rem] bg-background/60">
                                <p className="text-xs font-semibold tracking-[-0.01em]">{kp?.point ?? ''}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{kp?.details ?? ''}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Actionable Tips */}
                  {Array.isArray(msg?.data?.actionable_tips) && msg.data.actionable_tips.length > 0 && (
                    <div className="space-y-2">
                      {msg.data.actionable_tips.map((tip, j) => (
                        <div key={j} className="flex items-start gap-2.5 p-3 rounded-[0.75rem] bg-accent/5 border border-accent/10">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-accent">{j + 1}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold tracking-[-0.01em]">{tip?.tip ?? ''}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{tip?.implementation ?? ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-Up Questions */}
                  {Array.isArray(msg?.data?.follow_up_questions) && msg.data.follow_up_questions.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {msg.data.follow_up_questions.map((q, j) => (
                        <button
                          key={j}
                          onClick={() => onSendMessage(q)}
                          className="px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-xs text-foreground transition-colors tracking-[-0.01em] border border-border/30"
                        >
                          <RiQuestionLine className="w-3 h-3 inline mr-1" />
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <RiUserLine className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {chatLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <RiRobotLine className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-secondary/60 rounded-[0.875rem] rounded-bl-sm px-4 py-3 border border-border/30">
              <div className="flex items-center gap-2">
                <RiRefreshLine className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground tracking-[-0.01em]">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {chatError && (
          <div className="p-3 rounded-[0.875rem] bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {chatError}
          </div>
        )}
      </div>

      {/* Suggested questions when there are messages */}
      {(displayMessages.length > 0 || showSample) && (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(q)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-secondary/40 hover:bg-secondary text-xs text-foreground transition-colors tracking-[-0.01em] border border-border/30"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="flex gap-3 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about digital wellness..."
          className="rounded-full h-11 px-5 tracking-[-0.01em]"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={chatLoading}
        />
        <Button
          onClick={handleSend}
          disabled={chatLoading || !input.trim()}
          size="icon"
          className="rounded-full w-11 h-11 shrink-0"
        >
          <RiSendPlaneLine className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
