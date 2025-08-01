import json
import socket
import sys
import threading
import traceback

from queue import Queue


class SocketHandler:
    def __init__(self, command_queue: Queue, response_queue: Queue):
        self.command_queue = command_queue
        self.response_queue = response_queue

    def handle_client(self, conn: socket):
        def recv_loop() -> None:
            while True:
                try:
                    data = conn.recv(4096).decode()

                    if not data:
                        break

                    try:
                        msg = json.loads(data)
                    except json.JSONDecodeError:
                        print(f'[SocketServer] [WARN] 잘못된 JSON 형식 수신: {msg}')
                        continue

                    channel = msg.get('channel')

                    if not channel:
                        print(f'[SocketServer] [WARN] channel 없음: {msg}')
                        continue
                    
                    self.command_queue.put(msg)
                except Exception as e:
                    print('[SocketServer] [ERROR] 수신 처리 중 예외 발생: ')
                    traceback.print_exc()
                    break

        def send_loop() -> None:
            while True:
                try:
                    result = self.response_queue.get()
                    conn.sendall((json.dumps(result) + '\n').encode())
                except Exception as e:
                    print('[SocketServer] [ERROR] 메시지 전송 실패: ')
                    traceback.print_exc()

        threading.Thread(target=recv_loop, daemon=True).start()
        threading.Thread(target=send_loop, daemon=True).start()

    def start(self, host: str = '127.0.0.1', port: int = 65432):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((host, port))
        server_socket.listen()

        sys.stdout.write(f'[SocketServer] Listening on {host}:{port} \n')
        sys.stdout.flush()

        sys.stdout.write('READY\n')
        sys.stdout.flush()

        conn, addr = server_socket.accept()

        sys.stdout.write(f'[SocketServer] Client {addr} connected.\n')
        sys.stdout.flush()

        self.handle_client(conn)