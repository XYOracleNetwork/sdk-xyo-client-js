import { asHash } from '@xylabs/hex'
// eslint-disable-next-line import/no-internal-modules
import { expose } from '@xylabs/threads'
import shajs from 'sha.js'

expose({
  hash(data: string) {
    return asHash(shajs('sha256').update(data).digest().toString('hex'), true)
  },
})
