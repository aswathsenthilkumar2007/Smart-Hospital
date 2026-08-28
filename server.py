#!/usr/bin/env python3
"""
PulseFlow OS - Local Development Server
Serves the web application on http://localhost:3000
"""

import http.server
import mimetypes
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self._serve_file(send_body=False)

    def do_GET(self):
        self._serve_file(send_body=True)

    def _serve_file(self, send_body=True):
        clean_path = self.path.split('?')[0].lstrip('/')
        if not clean_path:
            clean_path = 'index.html'

        file_path = os.path.join(DIRECTORY, clean_path)

        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.send_response(404)
            self.end_headers()
            if send_body:
                self.wfile.write(b"404 Not Found")
            return

        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = 'application/octet-stream'

        try:
            file_size = os.path.getsize(file_path)
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            if send_body:
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            if send_body:
                self.wfile.write(str(e).encode('utf-8'))

    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format % args))

class ReusableThreadingServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

def run_server():
    os.chdir(DIRECTORY)
    ports_to_try = [3000, 3001, 8080, 5000]
    httpd = None
    active_port = PORT

    for p in ports_to_try:
        try:
            httpd = ReusableThreadingServer(("", p), Handler)
            active_port = p
            break
        except OSError:
            continue

    if not httpd:
        print("Error: Could not bind to any available port.")
        sys.exit(1)

    print(f"\n=======================================================")
    print(f"🏥 PulseFlow OS | Smart Hospital Flow Platform")
    print(f"🚀 Running locally at: http://localhost:{active_port}")
    print(f"📁 Serving files from: {DIRECTORY}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)

if __name__ == '__main__':
    run_server()
