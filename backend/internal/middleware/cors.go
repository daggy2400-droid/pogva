package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// Production origins always allowed
var productionOrigins = []string{
	"https://sfasion.netlify.app",
}

func CORS() gin.HandlerFunc {
	// Build allowed set: production origins + any extras from ALLOWED_ORIGINS env
	allowed := map[string]bool{}
	for _, o := range productionOrigins {
		allowed[o] = true
	}
	if raw := os.Getenv("ALLOWED_ORIGINS"); raw != "" {
		for _, o := range strings.Split(raw, ",") {
			allowed[strings.TrimSpace(o)] = true
		}
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin == "" || allowed[origin] {
			// Same-origin or known origin
			if origin != "" {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Vary", "Origin")
			}
		} else if len(allowed) == 0 {
			// No restrictions configured — dev mode
			c.Header("Access-Control-Allow-Origin", "*")
		} else {
			// Unknown origin in production — still allow (public API)
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
