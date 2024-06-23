/* eslint-disable @typescript-eslint/no-var-requires */
export const jsHashFunc = () => {
  const shajs = require('sha.js')
  const { asHash } = require('@xylabs/hex')
  const { expose } = require('@xylabs/threads/worker')

  expose({
    hash(data: string) {
      return asHash(shajs('sha256').update(data).digest().toString('hex'), true)
    },
  })
}
