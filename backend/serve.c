#include "serve.h"
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define BUFFER 4096
#define FRONTEND "frontend"


const char* get_mime_type(const char* path) {
    const char* ext = strrchr(path, '.'); // find last "."
    if (!ext) return "text/plain"; // default

    if (strcmp(ext, ".html") == 0 || strcmp(ext, ".htm") == 0)
        return "text/html";
    if (strcmp(ext, ".css") == 0)
        return "text/css";
    if (strcmp(ext, ".js") == 0)
        return "application/javascript";
    if (strcmp(ext, ".png") == 0)
        return "image/png";
    if (strcmp(ext, ".jpg") == 0 || strcmp(ext, ".jpeg") == 0)
        return "image/jpeg";
    if (strcmp(ext, ".gif") == 0)
        return "image/gif";
    if (strcmp(ext, ".svg") == 0)
        return "image/svg+xml";
    if (strcmp(ext, ".ico") == 0)
        return "image/x-icon";
    if (strcmp(ext, ".json") == 0)
        return "application/json";
    if (strcmp(ext, ".txt") == 0)
        return "text/plain";
    return "application/octet-stream";
}


void serve_file(int client_fd, const char *req_path) {
    
    //takes the client socket fd and requested path
    //and sends its contents as a http response


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

    const char *mime_type = get_mime_type(full_path);

    char response[BUFFER];
       snprintf(response, sizeof(response),
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: %s\r\n"
            "Connection: close\r\n"
            "\r\n",
            mime_type);

            
    write(client_fd, response, strlen(response));


    //read file in arrays and send them to client
    char file_buffer[BUFFER];
    size_t n;
    while ((n = fread(file_buffer, 1, sizeof(file_buffer), file)) > 0) {
        write(client_fd, file_buffer, n);
    }

    fclose(file);
}
