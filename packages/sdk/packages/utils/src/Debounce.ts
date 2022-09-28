import { delay } from '@xylabs/delay'

export class Debounce<TKey = string> {
  private map = new Map<TKey, number>()

  public async one<T>(key: TKey, closure: () => Promise<T>, timeout = 10000) {
    const startTime = Date.now()
    while (this.map.get(key)) {
      await delay(100)
      if (Date.now() - startTime > timeout) {
        throw Error(`Debounce timed out [${key}]`)
      }
    }
    try {
      this.map.set(key, 1)
      return await closure()
    } catch (ex) {
      console.error(`Debounce closure threw: ${ex}`)
      throw ex
    } finally {
      this.map.set(key, 0)
    }
  }
}
