FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

# Binary
COPY --from=builder /app/server .

# Migrations sit next to the binary so the default path resolution works
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

RUN mkdir -p images uploads

EXPOSE 8080
CMD ["./server"]
