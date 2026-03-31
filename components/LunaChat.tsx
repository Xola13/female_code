'use client'

// ============================================================
// Luna AI Chatbot — The Heart of Luna Beauty
// ============================================================
// Features:
// - Floating persistent chat widget
// - Streaming responses via Vercel AI SDK
// - Full tool calling (search products, generate bundles, etc.)
// - Behavioral profile injected into every message
// - Proactive greeting based on user's browsing history
// - Multi-turn conversation memory
// - Cloud sync consent toggle
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, X, Send, RefreshCw, ShoppingBag,
  ExternalLink, ChevronDown, Shield, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { loadProfile, saveProfile, getTopInterestLabel } from '@/lib/profile'
import { trackChatMessage } from '@/lib/analytics'
import { TypingIndicator } from '@/components/LoadingSkeleton'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

// ── Product Card in Chat ──────────────────────────────────────
function ChatProductCard({
  name,
  price,
  affiliateLink,
  brand,
}: {
  name: string
  price: string
  affiliateLink: string
  brand?: string
}) {
  return (
    <a
      href={affiliateLink}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2.5 hover:border-primary/40 hover:bg-muted/50 transition-all group"
    >
      <div>
        {brand && <p className="text-[10px] text-primary font-semibold uppercase">{brand}</p>}
        <p className="text-sm font-medium line-clamp-1">{name}</p>
        <p className="text-xs text-muted-foreground">{price}</p>
      </div>
      <div className="flex items-center gap-1 text-amber-500 group-hover:scale-110 transition-transform">
        <ShoppingBag className="w-4 h-4" />
        <ExternalLink className="w-3 h-3" />
      </div>
    </a>
  )
}

// ── Markdown-lite renderer for chat messages ──────────────────
function ChatMessageContent({ content }: { content: string }) {
  // Simple rendering: bold, links, product cards
  const lines = content.split('\n')

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Skip empty lines
        if (!line.trim()) return null

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const text = line.slice(2)
          return (
            <div key={i} className="flex gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
            </div>
          )
        }

        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\. (.+)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-primary font-bold shrink-0">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(numberedMatch[2]) }} />
            </div>
          )
        }

        // Regular paragraph
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        )
      })}
    </div>
  )
}

function formatInline(text: string): string {
  return text
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links: [text](url)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline font-medium inline-flex items-center gap-0.5">$1 <svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a>'
    )
}

// ── Main Chat Component ───────────────────────────────────────

export function LunaChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [greeting, setGreeting] = useState<string>('')
  const [cloudSync, setCloudSync] = useState(false)
  const [showPrivacyNote, setShowPrivacyNote] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load user profile on mount
  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    setCloudSync(p.cloudSyncConsent)

    // Generate proactive greeting
    generateGreeting(p)
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen])

  async function generateGreeting(p: UserProfile) {
    // Simple local greeting (no API call for first load)
    const label = getTopInterestLabel(p)
    const hasHistory = p.productAffinities.length > 0 || p.categoryWeights.length > 0

    if (hasHistory) {
      const topCategory = p.categoryWeights.sort((a, b) => b.weight - a.weight)[0]
      if (topCategory) {
        setGreeting(
          `Hi! I'm Luna ✨ I noticed you've been exploring ${topCategory.category} products. I have some incredible picks for you — want to see them?`
        )
      } else {
        setGreeting(`Hi! I'm Luna ✨ Based on your browsing, I've already learned a lot about your style. Ask me anything!`)
      }
    } else {
      setGreeting(`Hi! I'm Luna ✨ I'm your personal AI beauty advisor. Tell me what you're looking for, or take our Beauty Quiz and I'll find your perfect products instantly.`)
    }
  }

  // Vercel AI SDK useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } =
    useChat({
      api: '/api/chat',
      body: {
        // Inject the user's behavioral profile into every API call
        profile: profile ?? undefined,
      },
      onResponse: (response) => {
        if (!response.ok) {
          toast.error('Luna is taking a moment. Please try again.')
        }
      },
      onFinish: () => {
        trackChatMessage('assistant')
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      },
      onError: (err) => {
        console.error('[LunaChat] Error:', err)
        toast.error('Connection error. Please try again.')
      },
    })

  function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    trackChatMessage('user')
    handleSubmit(e)
  }

  function handleClearChat() {
    setMessages([])
    inputRef.current?.focus()
  }

  function toggleCloudSync() {
    const newValue = !cloudSync
    setCloudSync(newValue)

    if (profile) {
      const updatedProfile = { ...profile, cloudSyncConsent: newValue }
      setProfile(updatedProfile)
      saveProfile(updatedProfile)

      if (newValue) {
        toast.success('Cloud sync enabled. Your anonymous profile will be saved.')
        // Trigger sync
        fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: updatedProfile }),
        }).catch(() => {})
      } else {
        toast.info('Cloud sync disabled. Your profile stays on this device only.')
      }
    }
  }

  const hasMessages = messages.length > 0

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full',
          'bg-gradient-to-br from-luna-berry to-luna-rose',
          'shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200',
          'flex items-center justify-center',
          'animate-pulse-glow',
          isOpen && 'hidden'
        )}
        aria-label="Open Luna AI Chat"
      >
        <Sparkles className="w-6 h-6 text-white" />
        {/* Notification dot (pulsing) */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-background animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-[380px] max-w-[calc(100vw-2rem)]',
              'bg-card border border-border rounded-2xl shadow-2xl',
              'flex flex-col overflow-hidden',
              isMinimized ? 'h-auto' : 'h-[580px] max-h-[calc(100vh-6rem)]'
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-luna-berry to-luna-rose p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight">Luna Beauty AI</h3>
                  <p className="text-white/70 text-xs">
                    {isLoading ? 'Thinking...' : 'Your personal beauty oracle'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                  aria-label={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', isMinimized && 'rotate-180')}
                  />
                </button>
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                  aria-label="Clear chat"
                  title="Clear conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Greeting message (always shown) */}
                  {!hasMessages && greeting && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 chat-bubble-enter"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luna-berry to-luna-gold flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                          {greeting}
                        </div>

                        {/* Quick suggestions */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[
                            'Find me a foundation',
                            'Best anti-aging serums',
                            'Hair repair routine',
                            'What\'s trending?',
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                const fakeEvent = { preventDefault: () => {} } as React.FormEvent
                                handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>)
                                setTimeout(() => {
                                  // Set input and submit
                                  const form = document.getElementById('luna-chat-form') as HTMLFormElement
                                  form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                                }, 50)
                              }}
                              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors bg-background"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Conversation messages */}
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3 chat-bubble-enter',
                        message.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      {/* Avatar */}
                      {message.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luna-berry to-luna-gold flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">👤</span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={cn(
                          'max-w-[80%] text-sm',
                          message.role === 'assistant'
                            ? 'bg-muted rounded-2xl rounded-tl-sm px-4 py-3'
                            : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3'
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <ChatMessageContent content={message.content} />
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}

                  {/* Error state */}
                  {error && (
                    <div className="text-center text-xs text-destructive py-2">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Privacy note / Cloud sync toggle */}
                {showPrivacyNote && (
                  <div className="px-4 py-3 bg-muted/50 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground mb-0.5 flex items-center gap-1.5">
                          <Shield className="w-3 h-3" /> Anonymous Cloud Sync
                        </p>
                        <p>Save your beauty profile across devices. No email required. UUID only.</p>
                        <a href="/privacy" className="text-primary hover:underline">Privacy policy →</a>
                      </div>
                      <button onClick={toggleCloudSync} className="shrink-0">
                        {cloudSync ? (
                          <ToggleRight className="w-8 h-8 text-primary" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Input area */}
                <div className="border-t border-border p-3 shrink-0">
                  <form
                    id="luna-chat-form"
                    onSubmit={handleUserSubmit}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask Luna anything about beauty..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 rounded-full border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setShowPrivacyNote(!showPrivacyNote)}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3" />
                      Privacy & sync settings
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      Powered by Claude AI
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
