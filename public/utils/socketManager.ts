import * as net from 'net';

export enum SocketState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RETRY_WAITING = 'RETRY_WAITING',
  FAILED = 'FAILED',
};

type SocketMessageHandler = (data: any) => void;


export default class SocketManger {
    private socket: net.Socket | null = null;
    private buffer: string = '';
    private retryCount: number = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private state: SocketState = SocketState.DISCONNECTED;

    private readonly host: string;
    private readonly port: number;
    private readonly maxRetries: number;
    private readonly retryDelay: number;
    private readonly onMessage: SocketMessageHandler;
    private readonly onStateChange?: (state: SocketState) => void;
    private readonly pendingQueue: string[] = [];

    constructor(options: {
        host: string;
        port: number;
        maxRetries?: number;
        retryDelay?: number;
        onMessage: SocketMessageHandler;
        onStateChange?: (state: SocketState) => void;
    }) {
        this.host = options.host;
        this.port = options.port;
        this.maxRetries = options.maxRetries ?? 5;
        this.retryDelay = options.retryDelay ?? 2000;
        this.onMessage = options.onMessage;
        this.onStateChange = options.onStateChange;
    };

    private updateState(newState: SocketState) {
        this.state = newState;
        console.log(`[SOCKET STATE] -> ${newState}`);
        this.onStateChange?.(newState);

        if (newState === SocketState.CONNECTED) {
            console.log(newState);
            this.flushQueue();
        }
    };

    public connect() {
        if (this.socket) {
            this.cleanupSocket();
        }

        this.updateState(SocketState.CONNECTING);

        this.socket = new net.Socket();
        this.socket.setKeepAlive(true);

        this.socket.connect(this.port, this.host, () => {
            this.retryCount = 0;
            this.updateState(SocketState.CONNECTED);
        });

        this.socket.on('data', (chunk) => this.handleData(chunk));
        this.socket.on('error', (err) => this.handleError(err));
        this.socket.on('close', () => this.handleClose());
    };

    private handleData(chunk: Buffer) {
        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const data = JSON.parse(line);
                this.onMessage(data);
            } catch (e) {
                console.error('[SocketManager] JSON 파싱 실패:', line);
            }
        }
    };

    private handleError(err: Error) {
        console.error('[SocketManager] Socket error:', err.message);
        this.attemptReconnect();
    };

    private handleClose() {
        console.log('[SocketManager] Socket closed');
        this.attemptReconnect();
    };

    private attemptReconnect() {
        if (
            this.reconnectTimeout || 
            this.state === SocketState.CONNECTING || 
            this.state === SocketState.CONNECTED || 
            this.state === SocketState.RETRY_WAITING
        ) {
            console.debug('[SocketManager] Reconnect skipped: already reconnecting or connected');
            return;
        }

        if (this.retryCount >= this.maxRetries) {
            console.error('[SocketManager] Max retries reached. Giving up.');
            this.updateState(SocketState.FAILED);
            return;
        }

        this.retryCount++;
        this.updateState(SocketState.RETRY_WAITING);

        console.warn('[SocketManager] Attempting reconnect... retryCount:', this.retryCount);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, this.retryDelay);
    };

    private cleanupSocket() {
        this.socket?.removeAllListeners();
        this.socket?.destroy();
        this.socket = null;
    };

    private flushQueue() {
        const interval = 50;
        const sendNext = () => {
            const payload = this.pendingQueue.shift();
            if (!payload) return;

            this.send(payload);
            setTimeout(sendNext, interval);
        };

        sendNext();
    }

    public send(data: object | string) {
        let parsedData: object;

        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                console.error('[SocketManager] JSON.parse 실패:', data);
                return;
            }
        } else {
            parsedData = data;
        }

        const payload = JSON.stringify(parsedData) + '\n';

        if (this.socket && this.state === SocketState.CONNECTED) {
            console.log('[SocketManager] sending payload:', payload.trim());
            this.socket.write(payload, (err) => {
                if (err) {
                    console.error('[SocketManager] write error:', err.message);
                } else {
                    console.log('[SocketManager] payload flushed to socket');
                }
            });
        } else {
            console.warn('[SocketManager] Cannot send, Not connected, queueing:', payload.trim());
            this.pendingQueue.push(payload);
            this.attemptReconnect();
        }
    };

    public disconnect() {
        this.cleanupSocket();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.updateState(SocketState.DISCONNECTED);
    };

    public getState() {
        return this.state;
    };
};