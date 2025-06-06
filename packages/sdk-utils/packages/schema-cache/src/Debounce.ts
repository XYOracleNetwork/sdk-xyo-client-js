import { delay } from '@xylabs/delay'
import { isDefined } from '@xylabs/typeof'

export class Debounce<TKey = string> {
  private map = new Map<TKey, number>()

  async one<T>(key: TKey, closure: () => Promise<T>, timeout = 10_000) {
    const startTime = Date.now()
    while (isDefined(this.map.get(key))) {
      await delay(100)
      if (Date.now() - startTime > timeout) {
        throw new Error(`Debounce timed out [${key}]`)
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
