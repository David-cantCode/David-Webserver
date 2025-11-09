#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include "serve.h"

#include "terminal/terminal.h"

#define PORT 8080
#define BUFFER 4096



int create_server_socket() {
    int server_fd;
    struct sockaddr_in server_addr;

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; 
    server_addr.sin_port = htons(PORT);       

    // Bind socket to the adr
    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // listen to connections (10)
    if (listen(server_fd, 10) < 0) {
        perror("listen failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port %d\n", PORT);
    return server_fd;
}




void handle_client(int client_fd) {
    char buffer[BUFFER];
    ssize_t bytes_read = read(client_fd, buffer, sizeof(buffer) - 1);

    if (bytes_read <= 0) {
        perror("read failed");
        return;
    }

    buffer[bytes_read] = '\0';
    printf("Received request:\n%s\n", buffer);

    char method[16], path[128];
    sscanf(buffer, "%s %s", method, path);

    if (strcmp(path, "/") == 0) {
        strcpy(path, "/index.html");
    }

    // ---- HANDLE WEB TERMINAL ----
    if (strcmp(path, "/run") == 0 && strncmp(method, "POST", 4) == 0) {
        char *body = strstr(buffer, "\r\n\r\n");
        if (!body) {
            const char *bad = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nMissing body\n";
            write(client_fd, bad, strlen(bad));
            return;
        }
        body += 4; // skip headers
        handle_web_terminal(client_fd, body);
        return;
    }

    serve_file(client_fd, path);
}




int main() {
    int server_fd, client_fd;
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    server_fd = create_server_socket();

    while (1) {
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        if (client_fd < 0) {
            perror("accept failed");
            continue; 
        }

     
        handle_client(client_fd);


        close(client_fd);
    }


    close(server_fd);
    return 0;
}