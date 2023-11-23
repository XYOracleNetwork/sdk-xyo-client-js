import { base16, base58 } from '@scure/base'
import { assertEx } from '@xylabs/assert'
import { ifTypeOf } from '@xyo-network/typeof'

const stringToUint8Array = (value: string, base = 16) => {
  switch (base) {
    case 16:
      return base16.decode((value.startsWith('0x') ? value.slice(2) : value).toUpperCase())
    case 58:
      return base58.decode(value)
    default:
      throw Error(`Unsupported base [${base}]`)
  }
}

export function toUint8Array(value: undefined, padLength?: number, base?: number): undefined
export function toUint8Array(value: ArrayBuffer | string, padLength?: number, base?: number): Uint8Array
export function toUint8Array(value: ArrayBuffer | string | undefined, padLength?: number, base?: number): Uint8Array | undefined
export function toUint8Array(value?: ArrayBuffer | string, padLength?: number, base?: number): Uint8Array | undefined {
  if (value === undefined) return undefined

  let result: Uint8Array | undefined =
    ifTypeOf<string, Uint8Array>('string', value as string, (value) => stringToUint8Array(value, base)) ?? (value as Uint8Array)

  if (result === undefined) {
    throw Error(`toUint8Array - Unknown type: ${typeof value}`)
  }

  if (padLength && result.length < padLength) {
    result = new Uint8Array([...new Uint8Array(padLength - result.length), ...result])
    assertEx(result?.length <= padLength, 'Resulting length is greater than padLength')
  }

  return result
}
