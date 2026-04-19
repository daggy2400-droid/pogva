package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"samson-fashion-backend/internal/models"
	"samson-fashion-backend/internal/utils"
	ws "samson-fashion-backend/internal/websocket"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	db  *sql.DB
	hub *ws.Hub
}

func NewOrderHandler(db *sql.DB, hub *ws.Hub) *OrderHandler {
	return &OrderHandler{db: db, hub: hub}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	var price float64
	var stock int
	err := h.db.QueryRow("SELECT price, stock FROM products WHERE id = $1 AND is_active = TRUE", req.ProductID).
		Scan(&price, &stock)
	if err == sql.ErrNoRows {
		utils.Error(c, http.StatusNotFound, "product not found")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch product")
		return
	}
	if stock < req.Quantity {
		utils.Error(c, http.StatusBadRequest, "insufficient stock")
		return
	}

	totalPrice := price * float64(req.Quantity)

	tx, err := h.db.Begin()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to start transaction")
		return
	}
	defer tx.Rollback()

	var order models.Order
	err = tx.QueryRow(`
		INSERT INTO orders (customer_name, customer_phone, customer_email, product_id, quantity, size, color, total_price, notes, expires_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW() + INTERVAL '1 hour')
		RETURNING id, customer_name, customer_phone, customer_email, product_id, quantity, size, color, total_price, status, notes, expires_at, created_at, updated_at
	`, req.CustomerName, req.CustomerPhone, req.CustomerEmail, req.ProductID,
		req.Quantity, req.Size, req.Color, totalPrice, req.Notes,
	).Scan(
		&order.ID, &order.CustomerName, &order.CustomerPhone, &order.CustomerEmail,
		&order.ProductID, &order.Quantity, &order.Size, &order.Color,
		&order.TotalPrice, &order.Status, &order.Notes, &order.ExpiresAt,
		&order.CreatedAt, &order.UpdatedAt,
	)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to create order")
		return
	}

	_, err = tx.Exec("UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2", req.Quantity, req.ProductID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to update stock")
		return
	}

	if err := tx.Commit(); err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to commit transaction")
		return
	}

	h.hub.Broadcast("order_created", order)
	// Notify clients that this product is now hidden
	h.hub.Broadcast("product_updated", gin.H{"id": req.ProductID, "hidden": true})
	utils.Success(c, http.StatusCreated, order)
}

func (h *OrderHandler) GetOrders(c *gin.Context) {
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	query := `
		SELECT o.id, o.customer_name, o.customer_phone, o.customer_email,
		       o.product_id, o.quantity, o.size, o.color, o.total_price,
		       o.status, o.notes, o.expires_at, o.created_at, o.updated_at,
		       p.name AS product_name
		FROM orders o
		JOIN products p ON p.id = o.product_id
	`
	args := []interface{}{}
	if status != "" {
		query += " WHERE o.status = $1"
		args = append(args, status)
	}
	query += " ORDER BY o.created_at DESC LIMIT $" + strconv.Itoa(len(args)+1) + " OFFSET $" + strconv.Itoa(len(args)+2)
	args = append(args, limit, offset)

	rows, err := h.db.Query(query, args...)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch orders")
		return
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID, &o.CustomerName, &o.CustomerPhone, &o.CustomerEmail,
			&o.ProductID, &o.Quantity, &o.Size, &o.Color, &o.TotalPrice,
			&o.Status, &o.Notes, &o.ExpiresAt, &o.CreatedAt, &o.UpdatedAt,
			&o.ProductName,
		); err != nil {
			continue
		}
		orders = append(orders, o)
	}

	utils.Success(c, http.StatusOK, orders)
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid order id")
		return
	}

	var req models.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get product_id before updating so we can broadcast
	var productID int
	h.db.QueryRow("SELECT product_id FROM orders WHERE id = $1", id).Scan(&productID)

	_, err = h.db.Exec("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2", req.Status, id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to update order status")
		return
	}

	h.hub.Broadcast("order_status_updated", gin.H{"id": id, "status": req.Status})
	// When order is completed/cancelled/delivered, broadcast product as visible again
	if req.Status == models.OrderStatusDelivered ||
		req.Status == models.OrderStatusCancelled {
		h.hub.Broadcast("product_updated", gin.H{"id": productID, "hidden": false})
	}

	utils.Success(c, http.StatusOK, gin.H{"message": "order status updated"})
}
