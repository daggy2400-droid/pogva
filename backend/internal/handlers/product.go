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

type ProductHandler struct {
	db  *sql.DB
	hub *ws.Hub
}

func NewProductHandler(db *sql.DB, hub *ws.Hub) *ProductHandler {
	return &ProductHandler{db: db, hub: hub}
}

const productSelectCols = `
	p.id, p.name, p.description, p.price, p.category, p.stock,
	p.image_url, p.images, p.sizes, p.colors, p.is_active, p.is_premium,
	p.created_at, p.updated_at,
	COALESCE(r.average_rating, 0) AS average_rating,
	COALESCE(r.total_ratings, 0)  AS total_ratings
`

func scanProduct(rows interface {
	Scan(...interface{}) error
}, p *models.Product) error {
	return rows.Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Category, &p.Stock,
		&p.ImageURL, &p.Images, &p.Sizes, &p.Colors, &p.IsActive, &p.IsPremium,
		&p.CreatedAt, &p.UpdatedAt, &p.AverageRating, &p.TotalRatings,
	)
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	category := c.Query("category")
	search := c.Query("search")
	premium := c.Query("premium") // "true" | "false" | ""
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	query := `
		SELECT ` + productSelectCols + `
		FROM products p
		LEFT JOIN product_ratings_summary r ON r.product_id = p.id
		WHERE p.is_active = TRUE
		  AND NOT EXISTS (
		      SELECT 1 FROM orders o
		      WHERE o.product_id = p.id
		        AND o.status = 'pending'
		        AND o.expires_at > NOW()
		  )
	`
	args := []interface{}{}
	argIdx := 1

	if category != "" {
		query += " AND p.category = $" + strconv.Itoa(argIdx)
		args = append(args, category)
		argIdx++
	}
	if premium == "true" {
		query += " AND p.is_premium = TRUE"
	} else if premium == "false" {
		query += " AND p.is_premium = FALSE"
	}
	if search != "" {
		query += " AND (p.name ILIKE $" + strconv.Itoa(argIdx) + " OR p.description ILIKE $" + strconv.Itoa(argIdx) + ")"
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM (" + query + ") sub"
	var total int
	h.db.QueryRow(countQuery, args...).Scan(&total)

	query += " ORDER BY p.created_at DESC LIMIT $" + strconv.Itoa(argIdx) + " OFFSET $" + strconv.Itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.db.Query(query, args...)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch products")
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		if err := scanProduct(rows, &p); err != nil {
			continue
		}
		products = append(products, p)
	}

	utils.Paginated(c, http.StatusOK, products, total, page, limit)
}

// GetTrendingProducts returns top 6 trending products (highest rated + most ordered).
func (h *ProductHandler) GetTrendingProducts(c *gin.Context) {
	rows, err := h.db.Query(`
		SELECT ` + productSelectCols + `
		FROM products p
		LEFT JOIN product_ratings_summary r ON r.product_id = p.id
		LEFT JOIN (
			SELECT product_id, COUNT(*) AS order_count
			FROM orders WHERE status != 'cancelled'
			GROUP BY product_id
		) oc ON oc.product_id = p.id
		WHERE p.is_active = TRUE
		ORDER BY (COALESCE(r.average_rating,0) * 0.6 + COALESCE(oc.order_count,0) * 0.4) DESC
		LIMIT 6
	`)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch trending products")
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		if err := scanProduct(rows, &p); err != nil {
			continue
		}
		products = append(products, p)
	}
	utils.Success(c, http.StatusOK, products)
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid product id")
		return
	}

	var p models.Product
	err = h.db.QueryRow(`
		SELECT `+productSelectCols+`
		FROM products p
		LEFT JOIN product_ratings_summary r ON r.product_id = p.id
		WHERE p.id = $1 AND p.is_active = TRUE
	`, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Category, &p.Stock,
		&p.ImageURL, &p.Images, &p.Sizes, &p.Colors, &p.IsActive, &p.IsPremium,
		&p.CreatedAt, &p.UpdatedAt, &p.AverageRating, &p.TotalRatings,
	)
	if err == sql.ErrNoRows {
		utils.Error(c, http.StatusNotFound, "product not found")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch product")
		return
	}

	utils.Success(c, http.StatusOK, p)
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if req.Category == "" {
		utils.Error(c, http.StatusBadRequest, "category is required")
		return
	}

	var p models.Product
	err := h.db.QueryRow(`
		INSERT INTO products (name, description, price, category, stock, image_url, images, sizes, colors, is_premium)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id, name, description, price, category, stock, image_url, images, sizes, colors, is_active, is_premium, created_at, updated_at
	`, req.Name, req.Description, req.Price, req.Category, req.Stock,
		req.ImageURL, req.Images, req.Sizes, req.Colors, req.IsPremium,
	).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Category, &p.Stock,
		&p.ImageURL, &p.Images, &p.Sizes, &p.Colors, &p.IsActive, &p.IsPremium,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to create product")
		return
	}

	h.hub.Broadcast("product_created", p)
	utils.Success(c, http.StatusCreated, p)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid product id")
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	_, err = h.db.Exec(`
		UPDATE products SET
			name        = COALESCE($1, name),
			description = COALESCE($2, description),
			price       = COALESCE($3, price),
			category    = COALESCE($4, category),
			stock       = COALESCE($5, stock),
			image_url   = COALESCE($6, image_url),
			is_active   = COALESCE($7, is_active),
			is_premium  = COALESCE($8, is_premium),
			updated_at  = NOW()
		WHERE id = $9
	`, req.Name, req.Description, req.Price, req.Category, req.Stock, req.ImageURL, req.IsActive, req.IsPremium, id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to update product")
		return
	}

	h.hub.Broadcast("product_updated", gin.H{"id": id})
	utils.Success(c, http.StatusOK, gin.H{"message": "product updated"})
}

func (h *ProductHandler) GetAllProducts(c *gin.Context) {
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	baseQuery := `
		FROM products p
		LEFT JOIN product_ratings_summary r ON r.product_id = p.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if category != "" {
		baseQuery += " AND p.category = $" + strconv.Itoa(argIdx)
		args = append(args, category)
		argIdx++
	}

	var total int
	h.db.QueryRow("SELECT COUNT(*) "+baseQuery, args...).Scan(&total)

	selectQuery := "SELECT " + productSelectCols + baseQuery +
		" ORDER BY p.created_at DESC LIMIT $" + strconv.Itoa(argIdx) + " OFFSET $" + strconv.Itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.db.Query(selectQuery, args...)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch products")
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		if err := scanProduct(rows, &p); err != nil {
			continue
		}
		products = append(products, p)
	}

	utils.Paginated(c, http.StatusOK, products, total, page, limit)
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid product id")
		return
	}

	_, err = h.db.Exec("UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1", id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to delete product")
		return
	}

	h.hub.Broadcast("product_deleted", gin.H{"id": id})
	utils.Success(c, http.StatusOK, gin.H{"message": "product deleted"})
}
