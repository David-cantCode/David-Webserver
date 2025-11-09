# Variables
CC = gcc
CFLAGS = -Wall -O2
TARGET = server
SRC = main.c


all: $(TARGET)

# Compile main.c
$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET)


clean:
	rm -f $(TARGET)

# Run the server
run: $(TARGET)
	./$(TARGET)
