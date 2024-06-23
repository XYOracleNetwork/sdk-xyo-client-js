import { asHash } from '@xylabs/hex'
import { expose } from '@xylabs/threads/worker'
import { sha256 } from 'hash-wasm'

expose({
  async hash(data: string) {
    return asHash(await sha256(data), true)
  },
})
