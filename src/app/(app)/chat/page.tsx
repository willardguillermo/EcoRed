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
    <>
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .msg-in { animation: msgIn 0.22s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes iconGlow {
          0%, 100% { box-shadow: 0 0 18px rgba(0,137,123,0.14); }
          50%       { box-shadow: 0 0 34px rgba(0,137,123,0.26); }
        }
        .icon-glow { animation: iconGlow 3s ease-in-out infinite; }

        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.45; }
          30%            { transform: translateY(-5px); opacity: 1;    }
        }
        .dot { width:6px; height:6px; border-radius:50%; background:#00897B; display:inline-block; }
        .dot:nth-child(1) { animation: dotBounce 1.1s ease-in-out infinite 0ms; }
        .dot:nth-child(2) { animation: dotBounce 1.1s ease-in-out infinite 150ms; }
        .dot:nth-child(3) { animation: dotBounce 1.1s ease-in-out infinite 300ms; }

        .suggest-btn:hover {
          background: rgba(0,137,123,0.07) !important;
          border-color: rgba(0,137,123,0.28) !important;
        }
        .send-btn:not(:disabled):hover {
          filter: brightness(1.1);
          transform: scale(1.05);
        }
        .send-btn { transition: all 0.18s ease; }
      `}</style>

      <div className="flex flex-col h-full max-h-[calc(100vh-3.5rem)] md:max-h-screen">

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, #00897B 0%, #005F57 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0,137,123,0.28)',
              flexShrink: 0,
            }}>
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', lineHeight: 1 }}>EcoAsistente</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 5px #22C55E' }} />
                <p style={{ fontSize: 11, color: 'rgba(26,26,46,0.42)', fontWeight: 500 }}>En línea · IA activa</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              style={{
                padding: 8, borderRadius: 9, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'rgba(26,26,46,0.35)',
                transition: 'all 0.18s ease',
              }}
              className="hover:bg-muted hover:!text-[#1A1A2E]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Mensajes ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: '#F7F8FA' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 20, paddingBottom: 32 }}>
              <div className="icon-glow" style={{
                width: 68, height: 68, borderRadius: 20,
                background: 'linear-gradient(145deg, rgba(0,137,123,0.1), rgba(0,137,123,0.04))',
                border: '1px solid rgba(0,137,123,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Leaf className="h-8 w-8 text-[#00897B]" />
              </div>

              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1A1A2E', marginBottom: 6, letterSpacing: '-0.01em' }}>EcoAsistente</p>
                <p style={{ fontSize: 14, color: 'rgba(26,26,46,0.48)', maxWidth: 270, lineHeight: 1.65 }}>
                  Pregúntame sobre reciclaje, residuos, puntos de acopio o tu impacto ambiental.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: 320 }}>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="suggest-btn"
                    style={{
                      textAlign: 'left', fontSize: 13, padding: '10px 14px',
                      borderRadius: 12, cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.09)',
                      background: '#fff',
                      color: '#1A1A2E', fontWeight: 400,
                      transition: 'all 0.18s ease',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isUser = msg.role === "user"
                return (
                  <div
                    key={msg.id}
                    className={cn("flex gap-2 msg-in", isUser ? "justify-end" : "justify-start")}
                    style={{ animationDelay: `${Math.min(i * 25, 100)}ms` }}
                  >
                    {!isUser && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
                        background: 'linear-gradient(135deg, #00897B, #005F57)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,137,123,0.22)',
                      }}>
                        <Leaf className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      fontSize: 14, lineHeight: 1.65,
                      background: isUser
                        ? 'linear-gradient(135deg, #00897B 0%, #006B61 100%)'
                        : '#ffffff',
                      color: isUser ? '#ffffff' : '#1A1A2E',
                      border: isUser ? 'none' : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: isUser
                        ? '0 3px 10px rgba(0,137,123,0.28)'
                        : '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                      {msg.content === "" && !isUser ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 20 }}>
                          <span className="dot" />
                          <span className="dot" />
                          <span className="dot" />
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

        {/* ── Input ── */}
        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.07)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px 16px',
          flexShrink: 0,
        }}>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
            style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              rows={1}
              disabled={streaming}
              style={{
                flex: 1, resize: 'none', fontSize: 14, lineHeight: '1.5',
                borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
                background: '#F4F5F7', padding: '10px 14px',
                color: '#1A1A2E', outline: 'none',
                maxHeight: 128, overflowY: 'auto',
                transition: 'border-color 0.18s ease',
                opacity: streaming ? 0.6 : 1,
              }}
              className="focus:border-[#00897B]/40 focus:!bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="send-btn"
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: input.trim() && !streaming
                  ? 'linear-gradient(135deg, #00897B, #006B61)'
                  : 'rgba(0,0,0,0.07)',
                color: input.trim() && !streaming ? '#fff' : 'rgba(0,0,0,0.28)',
                border: 'none',
                cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
                boxShadow: input.trim() && !streaming ? '0 3px 10px rgba(0,137,123,0.3)' : 'none',
              }}
            >
              {streaming
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </button>
          </form>
          <p style={{ fontSize: 10, color: 'rgba(26,26,46,0.28)', textAlign: 'center', marginTop: 8 }}>
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </>
  )
}
