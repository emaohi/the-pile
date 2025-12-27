'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, ExternalLink, Check, Trash2, Clock, Sparkles, Play, FileText } from 'lucide-react'
import { markRead, submitTakeaway, submitVerdict, discardItem } from '@/app/actions/items'
import type { ItemWithRelations, Verdict } from '@/types'
import { cn, parseSourceData, getDomain, isYouTubeUrl } from '@/lib/utils'

type ReviewStep = 'read' | 'takeaway' | 'verdict'

interface ReviewFlowProps {
  item: ItemWithRelations
}

function StepIndicator({ currentStep }: { currentStep: ReviewStep }) {
  const steps = [
    { key: 'read', label: 'Read', number: 1 },
    { key: 'takeaway', label: 'Reflect', number: 2 },
    { key: 'verdict', label: 'Decide', number: 3 },
  ] as const

  const currentIndex = steps.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = step.key === currentStep

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500",
                  isComplete && "bg-primary text-primary-foreground scale-90",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className={cn(
                "mt-2 text-xs font-medium tracking-wide uppercase transition-colors duration-300",
                isCurrent ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-3 transition-colors duration-500",
                index < currentIndex ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ReviewFlow({ item }: ReviewFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<ReviewStep>(
    item.takeawayAt ? 'verdict' : item.readAt ? 'takeaway' : 'read'
  )
  const [takeaway, setTakeaway] = useState(item.takeaway ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sourceData = parseSourceData(item.sourceData)
  const sourceUrl = sourceData.url
  const domain = getDomain(sourceUrl)
  const isYouTube = isYouTubeUrl(sourceUrl)

  const handleMarkRead = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await markRead(item.id)
      setStep('takeaway')
    } catch (err) {
      console.error('Failed to mark read:', err)
      setError('Failed to save progress. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitTakeaway = async () => {
    if (takeaway.trim().length < 20) return
    setIsSubmitting(true)
    setError(null)
    try {
      await submitTakeaway(item.id, takeaway)
      setStep('verdict')
    } catch (err) {
      console.error('Failed to submit takeaway:', err)
      setError('Failed to save takeaway. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerdict = async (verdict: Verdict) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitVerdict(item.id, verdict)
      router.push('/')
    } catch (err) {
      console.error('Failed to submit verdict:', err)
      setError('Failed to save verdict. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDiscard = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await discardItem(item.id)
      router.push('/')
    } catch (err) {
      console.error('Failed to discard:', err)
      setError('Failed to discard item. Please try again.')
      setIsSubmitting(false)
    }
  }

  const SourceIcon = isYouTube ? Play : FileText

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-border/50">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to queue
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              disabled={isSubmitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Discard
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The item will be permanently removed from your queue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDiscard}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Progress Indicator */}
      <StepIndicator currentStep={step} />

      {/* Item Header Card */}
      <div className="bg-card rounded-2xl border-2 border-border p-6 mb-8 shadow-sm">
        <h1 className="font-serif text-2xl md:text-3xl font-medium leading-tight mb-4">
          {item.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="font-medium text-foreground/70">{domain}</span>
          {item.estimatedMinutes && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.estimatedMinutes} min
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {step === 'read' && (
          <div className="text-center space-y-8 py-8 animate-in fade-in duration-500">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <SourceIcon className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-medium">{isYouTube ? 'Time to watch' : 'Time to read'}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isYouTube
                  ? 'Watch the video and give it your full attention. Come back when you\'re ready to reflect.'
                  : 'Open the article and read it mindfully. Take your time—there\'s no rush. Come back when you\'re ready to reflect.'}
              </p>
            </div>

            {sourceUrl && (
              <Button asChild size="lg" variant="outline" className="gap-2">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  {isYouTube ? 'Open video' : 'Open article'}
                </a>
              </Button>
            )}

            <div className="pt-4">
              <Button
                onClick={handleMarkRead}
                disabled={isSubmitting}
                size="lg"
                className="gap-2 min-w-[200px]"
              >
                <Check className="w-4 h-4" />
                {isYouTube ? 'I\'ve finished watching' : 'I\'ve finished reading'}
              </Button>
            </div>
          </div>
        )}

        {step === 'takeaway' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-xl font-medium">What will you remember?</h2>
              <p className="text-muted-foreground text-sm">
                Capture the essence in your own words
              </p>
            </div>

            <div className="bg-card rounded-2xl border-2 border-border p-6 space-y-4">
              <Textarea
                value={takeaway}
                onChange={(e) => setTakeaway(e.target.value)}
                placeholder="The most important thing I learned is..."
                className="min-h-[140px] resize-none text-base border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                <span>
                  {takeaway.length < 20 ? (
                    <span className="text-amber-600">{20 - takeaway.length} more characters needed</span>
                  ) : (
                    <span className="text-green-600">Looking good</span>
                  )}
                </span>
                <span>{takeaway.length} characters</span>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Prompts to spark reflection
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                <li>• What surprised you most?</li>
                <li>• How does this connect to what you already know?</li>
                <li>• What will you do differently after reading this?</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmitTakeaway}
              disabled={takeaway.trim().length < 20 || isSubmitting}
              size="lg"
              className="w-full"
            >
              Continue to verdict
            </Button>
          </div>
        )}

        {step === 'verdict' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* User's takeaway */}
            <div className="bg-card rounded-2xl border-2 border-border p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Your takeaway
              </p>
              <blockquote className="font-serif text-lg italic text-foreground/90 border-l-2 border-primary pl-4">
                "{takeaway || item.takeaway}"
              </blockquote>
            </div>

            {/* AI Summary */}
            <div className="bg-secondary/30 rounded-2xl border border-border p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI Takeaway
              </p>
              {item.aiSummary ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.aiSummary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  AI takeaway will appear here once generated...
                </p>
              )}
            </div>

            {/* Verdict Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="font-serif text-xl font-medium">Make your verdict</h2>
                <p className="text-sm text-muted-foreground">Was this worth your time?</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleVerdict('keep')}
                  disabled={isSubmitting}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                    "border-border bg-card hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30",
                    "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold text-sm">Keep</span>
                  <span className="text-xs text-muted-foreground mt-1">Worth saving</span>
                </button>

                <button
                  onClick={() => handleVerdict('revisit')}
                  disabled={isSubmitting}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                    "border-border bg-card hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30",
                    "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">Revisit</span>
                  <span className="text-xs text-muted-foreground mt-1">Try again later</span>
                </button>

                <button
                  onClick={() => handleVerdict('discard')}
                  disabled={isSubmitting}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                    "border-border bg-card hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30",
                    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">Discard</span>
                  <span className="text-xs text-muted-foreground mt-1">Not useful</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
