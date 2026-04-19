'use client'

import { useEffect, useRef, useCallback } from 'react'
import { WS_URL } from '@/lib/api/client'
import type { WsEvent, WsEventType } from '@/lib/types'

type Handler<T = unknown> = (payload: T) => void

export function useWebSocket(handlers: Partial<Record<WsEventType, Handler>>) {
  const ws = useRef<WebSocket | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return

    const socket = new WebSocket(WS_URL)
    ws.current = socket

    socket.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WsEvent
        const handler = handlersRef.current[event.type]
        handler?.(event.payload)
      } catch {
        // ignore malformed messages
      }
    }

    socket.onclose = () => {
      // Reconnect after 3 s
      setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
    }
  }, [connect])
}
