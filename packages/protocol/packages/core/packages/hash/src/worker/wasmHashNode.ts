/* eslint-disable @typescript-eslint/no-var-requires */
export const wasmHashFunc = () => {
  const { sha256 } = require('hash-wasm')
  const { asHash } = require('@xylabs/hex')
  // eslint-disable-next-line import/no-internal-modules
  const { expose } = require('@xylabs/threads/worker')

  expose({
    async hash(data: string) {
      return asHash(await sha256(data), true)
    },
  })
}
