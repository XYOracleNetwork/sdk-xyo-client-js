import { asHash } from '@xylabs/hex'
// eslint-disable-next-line import/no-internal-modules
import { expose } from '@xylabs/threads/worker'
import { sha256 } from 'hash-wasm'

expose({
  async hash(data: string) {
    return asHash(await sha256(data), true)
  },
})
