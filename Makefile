# Variables
CC = gcc
CFLAGS = -Wall -O2
TARGET = server
SRC = $(shell find libary -type f -name "*.c")

# Default target
all: $(TARGET)

# Compile all .c files in /backend
$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET)

# Clean build files
clean:
	rm -f $(TARGET)

# Run the server
run: $(TARGET)
	./$(TARGET)
