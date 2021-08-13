import { assertEx } from '@xyo-network/sdk-xyo-js'
import shajs from 'sha.js'

import { XyoAddress } from '../../Address'
import { XyoBoundWitness } from '../../models'

class Builder {
  private _addresses: XyoAddress[] = []
  private _previous_hashes: (string | null)[] = []
  private _payload_schemas: string[] = []
  private _payloads: Record<string, unknown>[] = []

  private get _payload_hashes(): string[] {
    return this._payloads.map((payload) => {
      return Builder.hash(payload)
    })
  }

  public witness(address: XyoAddress, previousHash: string | null) {
    this._addresses?.push(address)
    this._previous_hashes?.push(previousHash)
    return this
  }

  public payload(schema: string, payload: Record<string, unknown>) {
    this._payload_schemas.push(schema)
    this._payloads.push(assertEx(Builder.sortObject(payload)))
    return this
  }

  public hashableFields(): XyoBoundWitness {
    const addresses = this._addresses.map((address) => address.publicKey)
    return {
      addresses: assertEx(addresses, 'Missing addresses'),
      payload_hashes: assertEx(this._payload_hashes, 'Missing payload_hashes'),
      payload_schemas: assertEx(this._payload_schemas, 'Missing payload_schemas'),
      previous_hashes: assertEx(this._previous_hashes, 'Missing previous_hashes'),
    }
  }

  public build(): XyoBoundWitness {
    const hashableFields = this.hashableFields() as unknown as Record<string, unknown>
    const _hash = Builder.hash(hashableFields)
    return { ...hashableFields, _client: 'js', _hash } as XyoBoundWitness
  }

  static sortObject<T extends Record<string, unknown>>(obj: T) {
    if (obj === null) {
      return null
    }
    const result: Record<string, unknown> = {} as Record<string, unknown>
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        if (Array.isArray(obj[key])) {
          result[key] = obj[key]
        } else if (typeof obj[key] === 'object') {
          result[key] = Builder.sortObject(obj[key] as Record<string, unknown>)
        } else {
          result[key] = obj[key]
        }
      })
    return result as T
  }

  static stringify<T extends Record<string, unknown>>(obj: T) {
    const sortedEntry = this.sortObject<T>(obj)
    return JSON.stringify(sortedEntry)
  }

  static hash<T extends Record<string, unknown>>(obj: T) {
    const stringObject = Builder.stringify<T>(obj)
    return shajs('sha256').update(stringObject).digest('hex')
  }
}

export default Builder
