
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "terminal.h"

#define BUFFER 4096


void handle_web_terminal(int client_fd, const char *request_body) {
    char cmd[1024];
    strncpy(cmd, request_body, sizeof(cmd) - 1);
    cmd[sizeof(cmd) - 1] = '\0';

    // Remove trailing CRLF if present
    char *cr = strpbrk(cmd, "\r\n");
    if (cr) *cr = '\0';

    // Append "2>&1" to redirect stderr to stdout
    char full_cmd[1056];
    snprintf(full_cmd, sizeof(full_cmd), "%s 2>&1", cmd);

    // Execute command
    FILE *fp = popen(full_cmd, "r");
    if (!fp) {
        const char *err = "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\nFailed to run command\n";
        write(client_fd, err, strlen(err));
        return;
    }

    // Send HTTP header
    const char *hdr = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\n";
    write(client_fd, hdr, strlen(hdr));

    //output commands (including errors) to client
    char outbuf[BUFFER];
    size_t n;
    while ((n = fread(outbuf, 1, sizeof(outbuf), fp)) > 0) {
        write(client_fd, outbuf, n);
    }

    pclose(fp);
}
