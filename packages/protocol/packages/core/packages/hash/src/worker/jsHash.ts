import { asHash } from '@xylabs/hex'
import { expose } from '@xylabs/threads/worker'
import shajs from 'sha.js'

expose({
  hash(data: string) {
    return asHash(shajs('sha256').update(data).digest().toString('hex'), true)
  },
})
