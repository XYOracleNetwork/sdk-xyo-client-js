import { delay } from '@xylabs/sdk-js'

export class Debounce<TKey = string> {
  private map = new Map<TKey, number>()

  public async one<T>(key: TKey, closure: () => Promise<T>, timeout = 10000) {
    const startTime = Date.now()
    while (this.map.get(key)) {
      await delay(100)
      if (Date.now() - startTime > timeout) {
        throw Error(`Debounce timedout [${key}]`)
      }
    }
    try {
      this.map.set(key, 1)
      return await closure()
    } finally {
      this.map.set(key, 0)
    }
  }
}
