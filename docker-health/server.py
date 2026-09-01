#!/usr/bin/env python3
"""Docker container health API — reads from the Docker socket, returns JSON."""
import json
import socket
import http.client
import http.server
import time

DOCKER_SOCKET = '/var/run/docker.sock'


class DockerConnection(http.client.HTTPConnection):
    """HTTPConnection over a Unix domain socket."""
    def __init__(self):
        super().__init__('localhost')

    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(DOCKER_SOCKET)
        self.sock.settimeout(5)


def docker_get(path):
    conn = DockerConnection()
    conn.request('GET', path)
    resp = conn.getresponse()
    data = resp.read().decode()
    conn.close()
    return json.loads(data) if data else {}


def get_containers():
    containers = docker_get('/containers/json?all=true')
    result = []

    for c in containers:
        name = (c.get('Names') or ['unknown'])[0].lstrip('/')
        state = c.get('State', 'unknown')

        # Fetch health check status (only present if a healthcheck is configured)
        health = None
        try:
            details = docker_get(f"/containers/{c['Id']}/json")
            health_info = details.get('State', {}).get('Health')
            if health_info:
                log_entries = health_info.get('Log') or []
                health = {
                    'status': health_info.get('Status', 'none'),
                    'failingStreak': health_info.get('FailingStreak', 0),
                    'log': (log_entries[-1].get('Output', '')[:200] if log_entries else '')
                }
        except Exception:
            pass

        # Parse ports
        ports = []
        for p in c.get('Ports', []):
            if p.get('PublicPort'):
                ports.append(f"{p.get('IP', '')}:{p['PublicPort']}\u2192{p['PrivatePort']}/{p.get('Type', '')}")
            elif p.get('PrivatePort'):
                ports.append(f"{p['PrivatePort']}/{p.get('Type', '')}")

        result.append({
            'id': c.get('Id', '')[:12],
            'name': name,
            'image': c.get('Image', ''),
            'status': c.get('Status', ''),
            'state': state,
            'ports': ports,
            'health': health,
            'created': c.get('Created', 0)
        })

    return result


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/containers':
            try:
                containers = get_containers()
                running = sum(1 for c in containers if c['state'] == 'running')
                stopped = len(containers) - running
                unhealthy = sum(1 for c in containers if c.get('health') and c['health']['status'] == 'unhealthy')
                healthy = sum(1 for c in containers if c.get('health') and c['health']['status'] == 'healthy')

                self._json({
                    'containers': containers,
                    'summary': {
                        'total': len(containers),
                        'running': running,
                        'stopped': stopped,
                        'healthy': healthy,
                        'unhealthy': unhealthy
                    },
                    'timestamp': time.time()
                })
            except Exception as e:
                self._json({'error': str(e)}, 500)
        elif self.path == '/api/health':
            self._json({'status': 'ok'})
        else:
            self.send_response(404)
            self.end_headers()

    def _json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass  # keep logs clean


if __name__ == '__main__':
    server = http.server.HTTPServer(('0.0.0.0', 8080), Handler)
    print('Docker health API listening on :8080', flush=True)
    server.serve_forever()
