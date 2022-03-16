import { bufferPolyfill } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'

import { ifTypeOf } from '../lib'

export const toUint8Array = (value: string | Uint8Array): Uint8Array => {
  bufferPolyfill()

  const convertedString = ifTypeOf<string, Uint8Array>('string', value as string, (value) => {
    return Uint8Array.from(Buffer.from(value, 'hex'))
  })

  return convertedString ?? (value as Uint8Array)
}
