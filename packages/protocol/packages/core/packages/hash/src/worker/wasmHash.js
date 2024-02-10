import { asHash } from '@xylabs/hex'
import { sha256 } from 'hash-wasm'
// eslint-disable-next-line import/no-internal-modules
import { expose } from 'threads/worker'

expose({
  async hash(data) {
    return asHash(await sha256(data), true)
  },
})
