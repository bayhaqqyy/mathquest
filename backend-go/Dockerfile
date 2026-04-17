# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git for downloading dependencies
RUN apk add --no-cache git

# Copy module files
COPY go.mod ./
# Add go.sum independently with wildcard so it won't fail if missing
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build the executable
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Final Stage (Minimal Image)
FROM alpine:latest

WORKDIR /root/

# Copy the pre-built binary
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
