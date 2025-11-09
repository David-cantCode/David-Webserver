#include "serve.h"
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define BUFFER 4096
#define FRONTEND "../frontend"

//takes the client socket fd and requested path
//and sends its contents as a http response


void serve_file(int client_fd, const char *req_path) {
    

    //get the full path of the file 
    char full_path[512];
    snprintf(full_path, sizeof(full_path), "%s%s", FRONTEND, req_path);

    printf("Opening file: %s\n", full_path);


    //open file in read mode
    FILE *file = fopen(full_path, "r");
    if (!file) {
        char *not_found = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found\n";
        write(client_fd, not_found, strlen(not_found));
        return;
    }

    char response[BUFFER];
    snprintf(response, sizeof(response), "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n");
    write(client_fd, response, strlen(response));


    //read file in arrays and send them to client
    char file_buffer[BUFFER];
    size_t n;
    while ((n = fread(file_buffer, 1, sizeof(file_buffer), file)) > 0) {
        write(client_fd, file_buffer, n);
    }

    fclose(file);
}
