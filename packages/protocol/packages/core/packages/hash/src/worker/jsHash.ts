/* eslint-disable @typescript-eslint/no-var-requires */
export const jsHashFunc = () => {
  const shajs = require('sha.js')
  const { asHash } = require('@xylabs/hex')
  // eslint-disable-next-line import/no-internal-modules
  const { expose } = require('threads/worker')

  expose({
    hash(data: string) {
      return asHash(shajs('sha256').update(data).digest().toString('hex'), true)
    },
  })
}
