#!/usr/bin/env python3

"""
Simple HTTP Server for OBS Studio Widgets

Serves static files with CORS enabled for local development.
Use this to host widget HTML files for OBS Browser Sources and Docks.

Usage:
    python3 server/serve.py
    python server/serve.py

Server runs on: http://localhost:8080
"""

import http.server
import socketserver
import os
import sys
from functools import partial

PORT = 8080

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers."""

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        sys.stdout.write("✅ %s\n" % (format % args))

def run_server():
    # Change to repository root directory
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(repo_root)

    # Create server
    Handler = CORSRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        os.system('clear')
        print(f"""
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎬  OBS Studio Widgets Server                      ║
║                                                       ║
║   Status:  RUNNING                                    ║
║   Port:    {PORT}                                        ║
║   URL:     http://localhost:{PORT}                       ║
║                                                       ║
║   📂 Serving from: {repo_root[-30:]:>30} ║
║                                                       ║
║   Press Ctrl+C to stop                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

📌 Available Widgets:

  🎨 Logo Overlay (Browser Source):
     http://localhost:{PORT}/widgets/overlays/logo-overlay.html

  🎛️  Logo Controller (Dock):
     http://localhost:{PORT}/widgets/controllers/logo-controller.html

🔧 OBS Setup:
  1. Add Browser Source → Use overlay URLs above
  2. Add Custom Dock → Use controller URLs above
  3. Configure in OBS → Advanced Scene Switcher (optional)

""")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped\n")
            sys.exit(0)

if __name__ == '__main__':
    run_server()
