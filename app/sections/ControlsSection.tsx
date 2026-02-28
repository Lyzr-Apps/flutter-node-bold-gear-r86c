'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RiTimeLine, RiAppsLine, RiShieldLine, RiArrowDownSLine, RiArrowUpSLine, RiCloseLine, RiAddLine, RiSearchLine, RiMoonLine, RiSunLine } from 'react-icons/ri'

interface ChildProfile {
  name: string
  age: number
}

interface ControlsSectionProps {
  selectedChild: number
  setSelectedChild: (i: number) => void
  children_profiles: ChildProfile[]
}

interface AppItem {
  name: string
  category: string
  allowed: boolean
}

const DEFAULT_APPS: AppItem[] = [
  { name: 'YouTube Kids', category: 'Streaming', allowed: true },
  { name: 'Minecraft', category: 'Gaming', allowed: true },
  { name: 'Khan Academy', category: 'Education', allowed: true },
  { name: 'Roblox', category: 'Gaming', allowed: true },
  { name: 'TikTok', category: 'Social Media', allowed: false },
  { name: 'Instagram', category: 'Social Media', allowed: false },
  { name: 'Netflix Kids', category: 'Streaming', allowed: true },
  { name: 'Discord', category: 'Communication', allowed: false },
  { name: 'Duolingo', category: 'Education', allowed: true },
  { name: 'Fortnite', category: 'Gaming', allowed: false },
  { name: 'WhatsApp', category: 'Communication', allowed: true },
  { name: 'Snapchat', category: 'Social Media', allowed: false },
]

const CATEGORIES = ['All', 'Social Media', 'Gaming', 'Education', 'Streaming', 'Communication']

function CollapsibleSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="glass-card rounded-[0.875rem]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-sm font-semibold tracking-[-0.01em]">{title}</h3>
        </div>
        {open ? <RiArrowUpSLine className="w-5 h-5 text-muted-foreground" /> : <RiArrowDownSLine className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <CardContent className="pt-0 pb-5 px-5">{children}</CardContent>}
    </Card>
  )
}

export default function ControlsSection({
  selectedChild,
  setSelectedChild,
  children_profiles
}: ControlsSectionProps) {
  const [dailyLimit, setDailyLimit] = useState([3])
  const [bedtimeStart, setBedtimeStart] = useState('21:00')
  const [bedtimeEnd, setBedtimeEnd] = useState('07:00')
  const [appLimits, setAppLimits] = useState<Record<string, number>>({
    'YouTube Kids': 60,
    'Minecraft': 90,
    'Roblox': 45,
  })
  const [apps, setApps] = useState<AppItem[]>(DEFAULT_APPS)
  const [appSearch, setAppSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [ageRating, setAgeRating] = useState('9+')
  const [contentFilters, setContentFilters] = useState({
    socialMedia: false,
    gaming: true,
    streaming: true,
    news: false,
  })
  const [blockedKeywords, setBlockedKeywords] = useState<string[]>(['violence', 'gambling'])
  const [newKeyword, setNewKeyword] = useState('')

  const filteredApps = apps.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(appSearch.toLowerCase())
    const matchCategory = selectedCategory === 'All' || a.category === selectedCategory
    return matchSearch && matchCategory
  })

  const toggleApp = (name: string) => {
    setApps(prev => prev.map(a => a.name === name ? { ...a, allowed: !a.allowed } : a))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !blockedKeywords.includes(newKeyword.trim().toLowerCase())) {
      setBlockedKeywords(prev => [...prev, newKeyword.trim().toLowerCase()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (kw: string) => {
    setBlockedKeywords(prev => prev.filter(k => k !== kw))
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
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

      {/* Screen Time Section */}
      <CollapsibleSection
        title="Screen Time Limits"
        icon={<RiTimeLine className="w-5 h-5 text-primary" />}
        defaultOpen={true}
      >
        <div className="space-y-6">
          {/* Daily Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium tracking-[-0.01em]">Daily Limit</Label>
              <span className="text-sm font-semibold text-primary">{dailyLimit[0]}h / day</span>
            </div>
            <Slider
              value={dailyLimit}
              onValueChange={setDailyLimit}
              min={0}
              max={8}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0h</span><span>4h</span><span>8h</span>
            </div>
          </div>

          {/* Bedtime Schedule */}
          <div className="space-y-3">
            <Label className="text-sm font-medium tracking-[-0.01em] flex items-center gap-2">
              <RiMoonLine className="w-4 h-4" /> Bedtime Schedule
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Device locks at</label>
                <Input
                  type="time"
                  value={bedtimeStart}
                  onChange={(e) => setBedtimeStart(e.target.value)}
                  className="rounded-[0.75rem] h-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <RiSunLine className="w-3 h-3" /> Unlocks at
                </label>
                <Input
                  type="time"
                  value={bedtimeEnd}
                  onChange={(e) => setBedtimeEnd(e.target.value)}
                  className="rounded-[0.75rem] h-10"
                />
              </div>
            </div>
          </div>

          {/* Per-App Limits */}
          <div className="space-y-3">
            <Label className="text-sm font-medium tracking-[-0.01em]">Per-App Time Limits</Label>
            <div className="space-y-4">
              {Object.entries(appLimits).map(([app, mins]) => (
                <div key={app} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm tracking-[-0.01em]">{app}</span>
                    <span className="text-xs font-medium text-primary">{mins} min</span>
                  </div>
                  <Slider
                    value={[mins]}
                    onValueChange={(v) => setAppLimits(prev => ({ ...prev, [app]: v[0] }))}
                    min={15}
                    max={180}
                    step={15}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* App Management */}
      <CollapsibleSection
        title="App Management"
        icon={<RiAppsLine className="w-5 h-5 text-primary" />}
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search apps..."
                className="rounded-[0.75rem] h-10 pl-9 tracking-[-0.01em]"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* App List */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {filteredApps.map((app) => (
              <div key={app.name} className="flex items-center justify-between p-3 rounded-[0.75rem] bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold", app.allowed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium tracking-[-0.01em]">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.category}</p>
                  </div>
                </div>
                <Switch
                  checked={app.allowed}
                  onCheckedChange={() => toggleApp(app.name)}
                />
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Content Filters */}
      <CollapsibleSection
        title="Content Filters"
        icon={<RiShieldLine className="w-5 h-5 text-primary" />}
      >
        <div className="space-y-5">
          {/* Age Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium tracking-[-0.01em]">Age Rating</Label>
            <Select value={ageRating} onValueChange={setAgeRating}>
              <SelectTrigger className="rounded-[0.75rem] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4+">Ages 4+</SelectItem>
                <SelectItem value="9+">Ages 9+</SelectItem>
                <SelectItem value="12+">Ages 12+</SelectItem>
                <SelectItem value="17+">Ages 17+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Toggles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium tracking-[-0.01em]">Content Categories</Label>
            <div className="space-y-2">
              {Object.entries(contentFilters).map(([key, value]) => {
                const labels: Record<string, string> = { socialMedia: 'Social Media', gaming: 'Gaming', streaming: 'Streaming', news: 'News' }
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-[0.75rem] bg-secondary/30">
                    <span className="text-sm tracking-[-0.01em]">{labels[key] ?? key}</span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setContentFilters(prev => ({ ...prev, [key]: checked }))}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Blocked Keywords */}
          <div className="space-y-3">
            <Label className="text-sm font-medium tracking-[-0.01em]">Blocked Keywords</Label>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword..."
                className="rounded-[0.75rem] h-10 tracking-[-0.01em]"
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="icon" variant="secondary" className="rounded-[0.75rem] h-10 w-10 shrink-0">
                <RiAddLine className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {blockedKeywords.map(kw => (
                <Badge key={kw} variant="secondary" className="px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors">
                    <RiCloseLine className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Save Notice */}
      <div className="p-4 rounded-[0.875rem] bg-primary/5 border border-primary/10 text-center">
        <p className="text-xs text-muted-foreground tracking-[-0.01em]">
          All changes are saved automatically for {children_profiles[selectedChild]?.name ?? 'this child'}'s profile.
        </p>
      </div>
    </div>
  )
}
