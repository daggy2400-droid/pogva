package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"samson-fashion-backend/internal/models"
	"samson-fashion-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type HeroHandler struct {
	db *sql.DB
}

func NewHeroHandler(db *sql.DB) *HeroHandler {
	return &HeroHandler{db: db}
}

const heroSelectCols = `id, type, image_url, video_url, title, subtitle, cta_label, cta_url, sort_order, is_active, created_at, updated_at`

func scanSlide(row interface{ Scan(...interface{}) error }, s *models.HeroSlide) error {
	return row.Scan(
		&s.ID, &s.Type, &s.ImageURL, &s.VideoURL,
		&s.Title, &s.Subtitle, &s.CtaLabel, &s.CtaURL,
		&s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
}

// GetSlides — public: returns active slides ordered by sort_order
func (h *HeroHandler) GetSlides(c *gin.Context) {
	rows, err := h.db.Query(
		`SELECT ` + heroSelectCols + ` FROM hero_slides WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC`,
	)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch slides")
		return
	}
	defer rows.Close()

	slides := []models.HeroSlide{}
	for rows.Next() {
		var s models.HeroSlide
		if scanSlide(rows, &s) == nil {
			slides = append(slides, s)
		}
	}
	utils.Success(c, http.StatusOK, slides)
}

// AdminGetSlides — admin: returns all slides
func (h *HeroHandler) AdminGetSlides(c *gin.Context) {
	rows, err := h.db.Query(
		`SELECT ` + heroSelectCols + ` FROM hero_slides ORDER BY sort_order ASC, id ASC`,
	)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch slides")
		return
	}
	defer rows.Close()

	slides := []models.HeroSlide{}
	for rows.Next() {
		var s models.HeroSlide
		if scanSlide(rows, &s) == nil {
			slides = append(slides, s)
		}
	}
	utils.Success(c, http.StatusOK, slides)
}

// CreateSlide — admin
func (h *HeroHandler) CreateSlide(c *gin.Context) {
	var req models.HeroSlideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var s models.HeroSlide
	err := h.db.QueryRow(`
		INSERT INTO hero_slides (type, image_url, video_url, title, subtitle, cta_label, cta_url, sort_order, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING `+heroSelectCols,
		req.Type, req.ImageURL, req.VideoURL,
		req.Title, req.Subtitle, req.CtaLabel, req.CtaURL,
		req.SortOrder, isActive,
	).Scan(
		&s.ID, &s.Type, &s.ImageURL, &s.VideoURL,
		&s.Title, &s.Subtitle, &s.CtaLabel, &s.CtaURL,
		&s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to create slide")
		return
	}
	utils.Success(c, http.StatusCreated, s)
}

// UpdateSlide — admin
func (h *HeroHandler) UpdateSlide(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid slide id")
		return
	}

	var req models.HeroSlideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var s models.HeroSlide
	err = h.db.QueryRow(`
		UPDATE hero_slides SET
			type       = $1,
			image_url  = $2,
			video_url  = $3,
			title      = $4,
			subtitle   = $5,
			cta_label  = $6,
			cta_url    = $7,
			sort_order = $8,
			is_active  = $9,
			updated_at = NOW()
		WHERE id = $10
		RETURNING `+heroSelectCols,
		req.Type, req.ImageURL, req.VideoURL,
		req.Title, req.Subtitle, req.CtaLabel, req.CtaURL,
		req.SortOrder, isActive, id,
	).Scan(
		&s.ID, &s.Type, &s.ImageURL, &s.VideoURL,
		&s.Title, &s.Subtitle, &s.CtaLabel, &s.CtaURL,
		&s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		utils.Error(c, http.StatusNotFound, "slide not found")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to update slide")
		return
	}
	utils.Success(c, http.StatusOK, s)
}

// DeleteSlide — admin
func (h *HeroHandler) DeleteSlide(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid slide id")
		return
	}

	res, err := h.db.Exec(`DELETE FROM hero_slides WHERE id = $1`, id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to delete slide")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		utils.Error(c, http.StatusNotFound, "slide not found")
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"message": "slide deleted"})
}
