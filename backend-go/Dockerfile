# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git for downloading dependencies
RUN apk add --no-cache git

# Copy module files
COPY go.mod ./
# Add go.sum independently with wildcard so it won't fail if missing
# Copy source code first so that `go mod tidy` can scan the imports
COPY . .

# Generate/Update go.mod and go.sum automatically inside the container
RUN go mod tidy

# Build the executable
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Final Stage (Minimal Image)
FROM alpine:latest

WORKDIR /root/

# Copy the pre-built binary
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
