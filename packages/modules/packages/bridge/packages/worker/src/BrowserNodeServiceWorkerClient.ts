import { ManifestPayload } from '@xyo-network/manifest'

import { Message, MessageBridge } from './MessageBridge'
import { MessageBridgeConfigSchema } from './MessageBridgeConfig'

export class BrowserNodeServiceWorkerClient {
  static async create(manifest: ManifestPayload) {
    /*const registration = await this.register()
    let timeout = 1000
    while (!registration.active && timeout > 0) {
      await delay(100)
      timeout -= 100
      if (timeout <= 0) {
        throw 'Unable to start ServiceWorker'
      }
    }*/

    const worker = new Worker(new URL('./worker/Worker.ts', import.meta.url))
    worker.postMessage({ manifest, type: 'createNode' })

    await new Promise((resolve, reject) => {
      const eventFunc = (event: MessageEvent) => {
        const timeout = setTimeout(() => {
          console.log('Node creation timeout')
          worker.removeEventListener('message', eventFunc)
          reject('Timeout')
        }, 1000)
        switch (event.data.type) {
          case 'nodeCreated': {
            clearTimeout(timeout)
            worker.removeEventListener('message', eventFunc)
            resolve(true)
            break
          }
          default: {
            const message: Message = event.data
            console.log(`Unknown Event (nodeCreated listener) [${JSON.stringify(event)}]: ${JSON.stringify(message, null, 2)}`)
            break
          }
        }
      }
      worker.addEventListener('message', eventFunc)
    })

    //registration.active?.postMessage({ command: 'initialize' }, [channel.port2])
    const bridge = new MessageBridge({ config: { schema: MessageBridgeConfigSchema }, worker })
    await bridge.start()
    return bridge
  }

  /*async register() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(new URL(scriptUrl, import.meta.url), {
          scope: './',
        })

        if (registration.installing) {
          console.log('Service worker installing')
        } else if (registration.waiting) {
          console.log('Service worker installed')
        } else if (registration.active) {
          console.log('Service worker active')
        }
        worker.postMessage('createNode')
        return worker
      } catch (error) {
        console.error(`ServiceWorker Registration failed with ${error}`)
      }
    }
    throw 'ServiceWorker not supported'
  }*/
}
