package models

import "time"

type Rating struct {
	ID        int       `json:"id" db:"id"`
	ProductID int       `json:"product_id" db:"product_id"`
	OrderID   *int      `json:"order_id,omitempty" db:"order_id"`
	Rating    int       `json:"rating" db:"rating"`
	Review    string    `json:"review" db:"review"`
	Reviewer  string    `json:"reviewer" db:"reviewer"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type CreateRatingRequest struct {
	ProductID int    `json:"product_id" binding:"required"`
	OrderID   *int   `json:"order_id"`
	Rating    int    `json:"rating" binding:"required,min=1,max=5"`
	Review    string `json:"review"`
	Reviewer  string `json:"reviewer"`
}
