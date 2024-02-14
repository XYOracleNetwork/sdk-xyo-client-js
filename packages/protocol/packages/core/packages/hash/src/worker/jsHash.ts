import { asHash } from '@xylabs/hex'
import shajs from 'sha.js'
// eslint-disable-next-line import/no-internal-modules
import { expose } from 'threads/worker'

expose({
  hash(data: string) {
    return asHash(shajs('sha256').update(data).digest().toString('hex'), true)
  },
})
