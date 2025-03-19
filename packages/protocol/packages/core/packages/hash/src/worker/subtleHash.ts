import { subtle } from '@xylabs/platform'
import { expose } from '@xylabs/threads/worker'

expose({
  async hash(data: ArrayBuffer) {
    return await subtle.digest('SHA-256', data)
  },
})
