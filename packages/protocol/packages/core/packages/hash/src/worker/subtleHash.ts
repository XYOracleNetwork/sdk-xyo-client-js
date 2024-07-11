import { subtle } from '@xylabs/platform'
// eslint-disable-next-line import/no-internal-modules
import { expose } from '@xylabs/threads'

expose({
  async hash(data: ArrayBuffer) {
    return await subtle.digest('SHA-256', data)
  },
})
