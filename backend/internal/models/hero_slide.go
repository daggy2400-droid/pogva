package models

import "time"

type HeroSlide struct {
	ID        int       `json:"id"`
	Type      string    `json:"type"` // image | video | mixed
	ImageURL  *string   `json:"image_url"`
	VideoURL  *string   `json:"video_url"`
	Title     *string   `json:"title"`
	Subtitle  *string   `json:"subtitle"`
	CtaLabel  *string   `json:"cta_label"`
	CtaURL    *string   `json:"cta_url"`
	SortOrder int       `json:"sort_order"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type HeroSlideRequest struct {
	Type      string  `json:"type" binding:"required,oneof=image video mixed"`
	ImageURL  *string `json:"image_url"`
	VideoURL  *string `json:"video_url"`
	Title     *string `json:"title"`
	Subtitle  *string `json:"subtitle"`
	CtaLabel  *string `json:"cta_label"`
	CtaURL    *string `json:"cta_url"`
	SortOrder int     `json:"sort_order"`
	IsActive  *bool   `json:"is_active"`
}
