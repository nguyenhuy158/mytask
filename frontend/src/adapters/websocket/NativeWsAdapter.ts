import type { IWsAdapter, WsMessage } from '../../ports/IWsAdapter'

export class NativeWsAdapter implements IWsAdapter {
  private socket: WebSocket | null = null
  private reconnectTimeout: number | null = null
  private onMessageCallback: ((data: WsMessage) => void) | null = null

  connect(onMessage: (data: WsMessage) => void, onStatus?: (connected: boolean) => void): void {
    this.onMessageCallback = onMessage
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws`

    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = () => {
      console.log('WebSocket connected')
      onStatus?.(true)
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.onMessageCallback?.(data)
      } catch (err) {
        console.error('WebSocket message error', err)
      }
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason)
      onStatus?.(false)
      if (event.code !== 1000) {
        this.reconnectTimeout = window.setTimeout(() => this.connect(onMessage, onStatus), 3000)
      }
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error', error)
      onStatus?.(false)
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout)
    }
    if (this.socket) {
      this.socket.onclose = null
      this.socket.close()
      this.socket = null
    }
  }
}

export const wsAdapter = new NativeWsAdapter()
