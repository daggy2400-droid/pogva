FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

RUN mkdir -p images uploads

# Hardcode migrations path — always correct in this image
ENV MIGRATIONS_PATH=/app/internal/database/migrations

EXPOSE 8080
CMD ["./server"]
