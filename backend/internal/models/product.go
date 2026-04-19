package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// StringArray handles PostgreSQL TEXT[] arrays
type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "{}", nil
	}
	// Convert to postgres array literal
	result := "{"
	for i, v := range s {
		if i > 0 {
			result += ","
		}
		result += fmt.Sprintf("%q", v)
	}
	result += "}"
	return result, nil
}

func (s *StringArray) Scan(src interface{}) error {
	if src == nil {
		*s = StringArray{}
		return nil
	}
	var str string
	switch v := src.(type) {
	case string:
		str = v
	case []byte:
		str = string(v)
	default:
		return fmt.Errorf("unsupported type: %T", src)
	}
	// Parse postgres array literal {a,b,c}
	if len(str) < 2 || str[0] != '{' || str[len(str)-1] != '}' {
		*s = StringArray{}
		return nil
	}
	inner := str[1 : len(str)-1]
	if inner == "" {
		*s = StringArray{}
		return nil
	}
	// Simple split — handles quoted strings too
	var result []string
	var current string
	inQuote := false
	for _, ch := range inner {
		switch {
		case ch == '"':
			inQuote = !inQuote
		case ch == ',' && !inQuote:
			result = append(result, current)
			current = ""
		default:
			current += string(ch)
		}
	}
	result = append(result, current)
	*s = result
	return nil
}

type Product struct {
	ID          int         `json:"id" db:"id"`
	Name        string      `json:"name" db:"name"`
	Description string      `json:"description" db:"description"`
	Price       float64     `json:"price" db:"price"`
	Category    string      `json:"category" db:"category"`
	Stock       int         `json:"stock" db:"stock"`
	ImageURL    string      `json:"image_url" db:"image_url"`
	Images      StringArray `json:"images" db:"images"`
	Sizes       StringArray `json:"sizes" db:"sizes"`
	Colors      StringArray `json:"colors" db:"colors"`
	IsActive    bool        `json:"is_active" db:"is_active"`
	IsPremium   bool        `json:"is_premium" db:"is_premium"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`

	// Joined fields
	AverageRating float64 `json:"average_rating,omitempty" db:"average_rating"`
	TotalRatings  int     `json:"total_ratings,omitempty" db:"total_ratings"`
}

type CreateProductRequest struct {
	Name        string      `json:"name" binding:"required"`
	Description string      `json:"description"`
	Price       float64     `json:"price" binding:"required,gt=0"`
	Category    string      `json:"category" binding:"required"`
	Stock       int         `json:"stock" binding:"min=0"`
	ImageURL    string      `json:"image_url"`
	Images      StringArray `json:"images"`
	Sizes       StringArray `json:"sizes"`
	Colors      StringArray `json:"colors"`
	IsPremium   bool        `json:"is_premium"`
}

type UpdateProductRequest struct {
	Name        *string     `json:"name"`
	Description *string     `json:"description"`
	Price       *float64    `json:"price"`
	Category    *string     `json:"category"`
	Stock       *int        `json:"stock"`
	ImageURL    *string     `json:"image_url"`
	Images      StringArray `json:"images"`
	Sizes       StringArray `json:"sizes"`
	Colors      StringArray `json:"colors"`
	IsActive    *bool       `json:"is_active"`
	IsPremium   *bool       `json:"is_premium"`
}
