"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Loader2, Leaf, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id:      string
  role:    "user" | "assistant"
  content: string
}

const SUGGESTED = [
  "¿Cómo reciclo una botella de plástico?",
  "¿Qué pasa con los residuos electrónicos?",
  "¿Cuánto CO₂ ahorro reciclando papel?",
  "¿Cómo puedo reciclar en casa fácilmente?",
]

export default function ChatPage() {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState("")
  const [streaming, setStreaming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text }
    const assistantId      = crypto.randomUUID()

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }])
    setInput("")
    setStreaming(true)

    abortRef.current = new AbortController()

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
        signal:  abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error("Error del servidor")

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   full    = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: full } : m)
        )
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Lo siento, ocurrió un error. Intenta de nuevo." }
              : m
          )
        )
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [messages, streaming])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleSuggestion(text: string) {
    setInput(text)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleReset() {
    abortRef.current?.abort()
    setMessages([])
    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3.5rem)] md:max-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#00897B] flex items-center justify-center">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A2E]">EcoAsistente</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <p className="text-xs text-muted-foreground">En línea</p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className="h-16 w-16 rounded-2xl bg-[#E0F2F1] flex items-center justify-center">
              <Leaf className="h-8 w-8 text-[#00897B]" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A2E] text-lg mb-1">¡Hola! Soy EcoAsistente 🌿</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Pregúntame sobre reciclaje, residuos, impacto ambiental o cómo mejorar tus hábitos sostenibles.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-[#E0F2F1] hover:border-[#00897B]/30 transition-colors text-[#1A1A2E]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.role === "user"
              return (
                <div key={msg.id} className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}>
                  {!isUser && (
                    <div className="h-7 w-7 rounded-full bg-[#00897B] flex items-center justify-center shrink-0 mt-0.5">
                      <Leaf className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "bg-[#00897B] text-white rounded-tr-sm"
                      : "bg-white border border-border text-[#1A1A2E] rounded-tl-sm"
                  )}>
                    {msg.content === "" && !isUser ? (
                      <div className="flex gap-1 items-center py-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00897B] animate-bounce [animation-delay:0ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00897B] animate-bounce [animation-delay:150ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00897B] animate-bounce [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-white px-4 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00897B]/30 focus:border-[#00897B] transition-colors max-h-32 overflow-y-auto disabled:opacity-60"
            style={{ lineHeight: "1.5" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              input.trim() && !streaming
                ? "bg-[#00897B] hover:bg-[#00796B] text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {streaming
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}
