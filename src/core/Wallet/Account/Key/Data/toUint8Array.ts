import { assertEx, BigNumber } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'

import { ifTypeOf } from '../../../../../lib'
import { XyoAbstractData } from './AbstractData'
import { XyoDataLike } from './XyoDataLike'

const stringToUint8Array = (value: string) => {
  return bufferToUint8Array(Buffer.from(value.startsWith('0x') ? value.substring(2) : value, 'hex'))
}

const bigNumberToUint8Array = (value: BigNumber) => {
  return bufferToUint8Array(value.toBuffer())
}

const bufferToUint8Array = (value: Buffer) => {
  return Uint8Array.from(value)
}

const xyoDataToUint8Array = (value: XyoAbstractData) => {
  return value.bytes
}

export const toUint8ArrayOptional = (value?: XyoDataLike, padLength?: number): Uint8Array | undefined => {
  return value ? toUint8Array(value, padLength) : undefined
}

export const toUint8Array = (value: XyoDataLike, padLength?: number): Uint8Array => {
  let result: Uint8Array | undefined =
    ifTypeOf<string, Uint8Array>('string', value as string, stringToUint8Array) ??
    ifTypeOf<BigNumber, Uint8Array | undefined>('object', value as BigNumber, bigNumberToUint8Array, BigNumber.isBN) ??
    ifTypeOf<Buffer, Uint8Array | undefined>('object', value as Buffer, bufferToUint8Array, Buffer.isBuffer) ??
    ifTypeOf<XyoAbstractData, Uint8Array | undefined>('object', value as Buffer, xyoDataToUint8Array, XyoAbstractData.isXyoData) ??
    (value as Uint8Array)

  if (padLength !== undefined) {
    if (result.length < padLength) {
      result = new Uint8Array([...new Uint8Array(padLength - result.length), ...result])
    }
  }

  assertEx(padLength === undefined || result?.length <= padLength, 'Resulting length is greater than padLength')

  return result
}
