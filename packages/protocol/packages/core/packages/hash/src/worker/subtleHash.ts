import { subtle } from '@xylabs/platform'
import { expose } from '@xylabs/threads'

expose({
  async hash(data: ArrayBuffer) {
    return await subtle.digest('SHA-256', data)
  },
})
