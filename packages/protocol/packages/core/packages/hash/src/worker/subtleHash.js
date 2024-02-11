import { subtle } from '@xylabs/platform'
// eslint-disable-next-line import/no-internal-modules
import { expose } from 'threads/worker'

expose({
  async hash(data) {
    return await subtle.digest('SHA-256', data)
  },
})
