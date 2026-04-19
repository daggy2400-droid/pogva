package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"samson-fashion-backend/internal/models"
	"samson-fashion-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	db *sql.DB
}

func NewAdminHandler(db *sql.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	var totalProducts, totalOrders, pendingOrders int
	var totalRevenue float64

	h.db.QueryRow("SELECT COUNT(*) FROM products WHERE is_active = TRUE").Scan(&totalProducts)
	h.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders)
	h.db.QueryRow("SELECT COUNT(*) FROM orders WHERE status = 'pending'").Scan(&pendingOrders)
	h.db.QueryRow("SELECT COALESCE(SUM(total_price),0) FROM orders WHERE status = 'delivered'").Scan(&totalRevenue)

	utils.Success(c, http.StatusOK, gin.H{
		"total_products": totalProducts,
		"total_orders":   totalOrders,
		"pending_orders": pendingOrders,
		"total_revenue":  totalRevenue,
	})
}

// AddProductImage returns a handler that appends an image URL to a product's images array.
func AddProductImage(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "use NewAdminHandler methods")
}

// RemoveProductImage returns a handler that removes an image by index from a product's images array.
func RemoveProductImage(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "use NewAdminHandler methods")
}

func (h *AdminHandler) AddProductImage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid product id")
		return
	}

	var req struct {
		URL string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	var p models.Product
	err = h.db.QueryRow(`
		UPDATE products
		SET images = array_append(COALESCE(images, '{}'), $1), updated_at = NOW()
		WHERE id = $2
		RETURNING id, images
	`, req.URL, id).Scan(&p.ID, &p.Images)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to add image")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{"id": p.ID, "images": p.Images})
}

func (h *AdminHandler) RemoveProductImage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid product id")
		return
	}
	idx, err := strconv.Atoi(c.Param("idx"))
	if err != nil || idx < 1 {
		utils.Error(c, http.StatusBadRequest, "invalid image index (1-based)")
		return
	}

	var p models.Product
	err = h.db.QueryRow(`
		UPDATE products
		SET images = (
			SELECT array_agg(elem ORDER BY pos)
			FROM unnest(images) WITH ORDINALITY AS t(elem, pos)
			WHERE pos <> $1
		), updated_at = NOW()
		WHERE id = $2
		RETURNING id, images
	`, idx, id).Scan(&p.ID, &p.Images)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to remove image")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{"id": p.ID, "images": p.Images})
}
