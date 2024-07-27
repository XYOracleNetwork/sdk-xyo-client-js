/* eslint-disable @typescript-eslint/no-var-requires */
export const wasmHashFunc = () => {
  const { sha256 } = require('hash-wasm')
  const { asHash } = require('@xylabs/hex')

  const { expose } = require('@xylabs/threads/worker')

  expose({
    async hash(data: string) {
      return asHash(await sha256(data), true)
    },
  })
}
