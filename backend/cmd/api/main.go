package main

import (
	"log"
	"os"
	"path/filepath"

	"samson-fashion-backend/internal/database"
	"samson-fashion-backend/internal/handlers"
	"samson-fashion-backend/internal/middleware"
	"samson-fashion-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()

	// MIGRATIONS_PATH env overrides default; default resolves relative to binary
	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		exe, _ := os.Executable()
		migrationsPath = filepath.Join(filepath.Dir(exe), "internal", "database", "migrations")
	}

	if err := database.RunMigrations(db, migrationsPath); err != nil {
		log.Printf("WARNING: Migration error (server will still start): %v", err)
	}

	hub := websocket.NewHub()

	r := gin.Default()
	r.Use(middleware.CORS())
	r.Static("/uploads", "./uploads")
	r.Static("/images", "./images")

	r.GET("/ws", hub.Handler)

	productHandler := handlers.NewProductHandler(db, hub)
	orderHandler := handlers.NewOrderHandler(db, hub)
	adminHandler := handlers.NewAdminHandler(db)
	authHandler := handlers.NewAuthHandler(db)
	heroHandler := handlers.NewHeroHandler(db)

	api := r.Group("/api/v1")
	{
		api.GET("/products", productHandler.GetProducts)
		api.GET("/products/:id", productHandler.GetProduct)
		api.POST("/orders", orderHandler.CreateOrder)
		api.POST("/auth/login", authHandler.Login)
		api.GET("/hero/slides", heroHandler.GetSlides)
	}

	r.GET("/api/products", productHandler.GetProducts)
	r.GET("/api/products/:id", productHandler.GetProduct)
	r.POST("/api/orders", orderHandler.CreateOrder)

	admin := r.Group("/api/v1/admin")
	admin.Use(middleware.AdminAuth())
	{
		admin.GET("/dashboard", adminHandler.GetDashboardStats)
		admin.GET("/products", productHandler.GetAllProducts)
		admin.POST("/products", productHandler.CreateProduct)
		admin.PUT("/products/:id", productHandler.UpdateProduct)
		admin.DELETE("/products/:id", productHandler.DeleteProduct)
		admin.GET("/orders", orderHandler.GetOrders)
		admin.PATCH("/orders/:id/status", orderHandler.UpdateOrderStatus)
		admin.POST("/products/:id/images", adminHandler.AddProductImage)
		admin.DELETE("/products/:id/images/:idx", adminHandler.RemoveProductImage)
		admin.GET("/hero/slides", heroHandler.AdminGetSlides)
		admin.POST("/hero/slides", heroHandler.CreateSlide)
		admin.PUT("/hero/slides/:id", heroHandler.UpdateSlide)
		admin.DELETE("/hero/slides/:id", heroHandler.DeleteSlide)
		admin.POST("/images", handlers.UploadImage)
	}

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
