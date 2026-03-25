'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AskTCProps {
  agentId: string
}

const EXAMPLE_PROMPTS = [
  'What deadlines are coming up?',
  'Status on 123 Main St?',
  'Draft an email to the lender',
]

export function AskTC({ agentId }: AskTCProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data: { reply?: string; error?: string } = await res.json()
      const reply = data.reply ?? data.error ?? 'Something went wrong.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to reach the server. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function clearConversation() {
    setMessages([])
    setInput('')
  }

  const hasMessages = messages.length > 0

  return (
    <div className="rounded-xl border border-[#e8e2d9] bg-white p-4">
      {/* Conversation thread */}
      {hasMessages && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-[#b0a698]">Conversation</span>
          <button
            onClick={clearConversation}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[#b0a698] hover:bg-[#f5f0ea] hover:text-[#7a6e63]"
            aria-label="Clear conversation"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {hasMessages && (
        <div ref={scrollRef} className="mb-3 max-h-[240px] space-y-2 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl p-3 text-sm text-[#2c2420] ${
                  msg.role === 'user'
                    ? 'bg-[#f5f0ea]'
                    : 'border border-[#e8e2d9] bg-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-[#e8e2d9] bg-white p-3">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b0a698] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b0a698] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b0a698] [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example prompts (when no messages) */}
      {!hasMessages && !isLoading && (
        <div className="mb-3 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-[#e8e2d9] px-3 py-1 text-xs text-[#b0a698] transition-colors hover:border-[#84c9d1] hover:text-[#84c9d1]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI TC anything..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-[#e8e2d9] bg-white px-4 py-2.5 text-sm text-[#2c2420] placeholder-[#b0a698] outline-none transition-colors focus:border-[#84c9d1] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#84c9d1] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h10M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  )
}
