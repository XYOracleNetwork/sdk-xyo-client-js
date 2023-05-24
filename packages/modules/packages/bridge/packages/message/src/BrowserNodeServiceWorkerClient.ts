import { MessageBridge } from './MessageBridge'
import { MessageBridgeConfigSchema } from './MessageBridgeConfig'

export class BrowserNodeServiceWorkerClient {
  createBridge() {
    const channel = new self.MessageChannel()
    channel.port1.addEventListener('message', (message: MessageEvent) => {
      self.postMessage(message)
    })
    const bridge = new MessageBridge({ channel, config: { schema: MessageBridgeConfigSchema } })
    return bridge
  }

  async register(scriptUrl: string) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(scriptUrl, {
          scope: './',
        })

        if (registration.installing) {
          console.log('Service worker installing')
        } else if (registration.waiting) {
          console.log('Service worker installed')
        } else if (registration.active) {
          console.log('Service worker active')
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`)
      }
    }
  }
}
