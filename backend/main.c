#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 8080
#define BUFFER 4096
#define WWW_DIR "./www"  // Folder to serve

void serve_file(int client_fd, const char *path) {
    char full_path[512];
    snprintf(full_path, sizeof(full_path), "%s%s", WWW_DIR, path);

    FILE *file = fopen(full_path, "r");
    if (!file) {
        char *not_found = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found\n";
        write(client_fd, not_found, strlen(not_found));
        return;
    }

    char response[BUFFER];
    snprintf(response, sizeof(response), "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n");
    write(client_fd, response, strlen(response));

    char file_buffer[BUFFER];
    size_t n;
    while ((n = fread(file_buffer, 1, sizeof(file_buffer), file)) > 0) {
        write(client_fd, file_buffer, n);
    }

    fclose(file);
}

int main() {
    int server_fd, client_fd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[BUFFER];

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 10) < 0) {
        perror("listen failed");
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port %d\n", PORT);

    while (1) {
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        if (client_fd < 0) {
            perror("accept failed");
            continue;
        }

        read(client_fd, buffer, sizeof(buffer));
        printf("Received request:\n%s\n", buffer);

        // Parse the requested path
        char method[16], path[128];
        sscanf(buffer, "%s %s", method, path);

        // Default to /index.html
        if (strcmp(path, "/") == 0) {
            strcpy(path, "/index.html");
        }

        serve_file(client_fd, path);
        close(client_fd);
    }

    close(server_fd);
    return 0;
}
