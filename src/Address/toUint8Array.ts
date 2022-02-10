import { bufferPolyfill } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'

export const toUint8Array = (value: string | Uint8Array) => {
  bufferPolyfill()
  if (typeof value === 'string') {
    return Uint8Array.from(Buffer.from(value, 'hex'))
  } else {
    return value
  }
}
