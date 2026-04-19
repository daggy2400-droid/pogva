package models

import "time"

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type Order struct {
	ID            int         `json:"id" db:"id"`
	CustomerName  string      `json:"customer_name" db:"customer_name"`
	CustomerPhone string      `json:"customer_phone" db:"customer_phone"`
	CustomerEmail string      `json:"customer_email" db:"customer_email"`
	ProductID     int         `json:"product_id" db:"product_id"`
	Quantity      int         `json:"quantity" db:"quantity"`
	Size          string      `json:"size" db:"size"`
	Color         string      `json:"color" db:"color"`
	TotalPrice    float64     `json:"total_price" db:"total_price"`
	Status        OrderStatus `json:"status" db:"status"`
	Notes         string      `json:"notes" db:"notes"`
	ExpiresAt     time.Time   `json:"expires_at" db:"expires_at"`
	CreatedAt     time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at" db:"updated_at"`

	// Joined fields
	ProductName string `json:"product_name,omitempty" db:"product_name"`
}

type CreateOrderRequest struct {
	CustomerName  string `json:"customer_name" binding:"required"`
	CustomerPhone string `json:"customer_phone" binding:"required"`
	CustomerEmail string `json:"customer_email"`
	ProductID     int    `json:"product_id" binding:"required"`
	Quantity      int    `json:"quantity" binding:"required,min=1"`
	Size          string `json:"size"`
	Color         string `json:"color"`
	Notes         string `json:"notes"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" binding:"required"`
}
