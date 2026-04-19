package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"samson-fashion-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db *sql.DB
}

func NewAuthHandler(db *sql.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "username and password required")
		return
	}

	var id int
	var hashedPassword, role string
	err := h.db.QueryRow(
		"SELECT id, password, role FROM admin_users WHERE username = $1",
		req.Username,
	).Scan(&id, &hashedPassword, &role)

	if err == sql.ErrNoRows {
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "login failed")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token := MakeToken(req.Username, os.Getenv("JWT_SECRET"))
	utils.Success(c, http.StatusOK, gin.H{
		"token":    token,
		"username": req.Username,
		"role":     role,
	})
}

// MakeToken creates a simple HMAC-SHA256 token: "username:expiry:signature"
func MakeToken(username, secret string) string {
	expiry := strconv.FormatInt(time.Now().Add(24*time.Hour).Unix(), 10)
	payload := username + ":" + expiry
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))
	return payload + ":" + sig
}

// ValidateToken checks the HMAC signature and expiry
func ValidateToken(token, secret string) (string, bool) {
	parts := strings.SplitN(token, ":", 3)
	if len(parts) != 3 {
		return "", false
	}
	username, expiry, sig := parts[0], parts[1], parts[2]

	exp, err := strconv.ParseInt(expiry, 10, 64)
	if err != nil || time.Now().Unix() > exp {
		return "", false
	}

	payload := fmt.Sprintf("%s:%s", username, expiry)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(sig), []byte(expected)) {
		return "", false
	}
	return username, true
}
