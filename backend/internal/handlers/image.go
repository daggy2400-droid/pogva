package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"samson-fashion-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

const uploadDir = "./uploads"

// allowedMagic maps file extension to known magic byte prefixes.
var allowedMagic = map[string][]byte{
	".jpg":  {0xFF, 0xD8, 0xFF},
	".jpeg": {0xFF, 0xD8, 0xFF},
	".png":  {0x89, 0x50, 0x4E, 0x47},
	".webp": {0x52, 0x49, 0x46, 0x46}, // RIFF....WEBP
}

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "image file required")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	magic, extAllowed := allowedMagic[ext]
	if !extAllowed {
		utils.Error(c, http.StatusBadRequest, "only jpg, png, webp images are allowed")
		return
	}

	// Validate magic bytes — ensures the file is actually the image type it claims to be
	src, err := file.Open()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to open uploaded file")
		return
	}
	defer src.Close()

	header := make([]byte, 12)
	if _, err := io.ReadFull(src, header); err != nil {
		utils.Error(c, http.StatusBadRequest, "file too small or unreadable")
		return
	}
	if !bytes.HasPrefix(header, magic) {
		utils.Error(c, http.StatusBadRequest, "file content does not match its extension — upload a real image")
		return
	}
	// For webp, also verify the WEBP marker at bytes 8-11
	if ext == ".webp" && string(header[8:12]) != "WEBP" {
		utils.Error(c, http.StatusBadRequest, "file is not a valid WebP image")
		return
	}

	// File size limit: 10 MB
	const maxSize = 10 << 20
	if file.Size > maxSize {
		utils.Error(c, http.StatusBadRequest, "image must be smaller than 10 MB")
		return
	}

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to create upload directory")
		return
	}

	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	dst := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to save image")
		return
	}

	utils.Success(c, http.StatusCreated, gin.H{"url": "/uploads/" + filename})
}
