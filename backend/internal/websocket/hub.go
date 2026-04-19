package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	gorillaws "github.com/gorilla/websocket"
)

var upgrader = gorillaws.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Event is the message broadcast to all clients.
type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Hub manages all active WebSocket connections.
type Hub struct {
	mu      sync.RWMutex
	clients map[*gorillaws.Conn]struct{}
}

func NewHub() *Hub {
	return &Hub{clients: make(map[*gorillaws.Conn]struct{})}
}

// Broadcast sends an event to every connected client.
func (h *Hub) Broadcast(eventType string, payload interface{}) {
	msg, err := json.Marshal(Event{Type: eventType, Payload: payload})
	if err != nil {
		return
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.clients {
		if err := conn.WriteMessage(gorillaws.TextMessage, msg); err != nil {
			log.Printf("ws write error: %v", err)
		}
	}
}

// Handler upgrades the HTTP connection and keeps it alive.
func (h *Hub) Handler(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("ws upgrade error: %v", err)
		return
	}

	h.mu.Lock()
	h.clients[conn] = struct{}{}
	h.mu.Unlock()

	defer func() {
		h.mu.Lock()
		delete(h.clients, conn)
		h.mu.Unlock()
		conn.Close()
	}()

	// Keep reading to detect disconnects; discard client messages.
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}
