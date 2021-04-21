import { assertEx } from '@xyo-network/sdk-xyo-js'
import shajs from 'sha.js'

import { XyoBoundWitnessJson } from '../models'

class Builder {
  private _addresses: string[] = []
  private _previous_hashes: (string | null)[] = []
  private _payloads: Record<string, any>[] = []

  private get _payload_hashes(): string[] {
    return this._payloads.map((payload) => {
      return Builder.hash(payload)
    })
  }

  public witness(address: string, previousHash: string | null) {
    this._addresses?.push(address)
    this._previous_hashes?.push(previousHash)
    return this
  }

  public payload(payload: Record<string, any>) {
    this._payloads.push(assertEx(Builder.sortObject(payload)))
    return this
  }

  public hashableFields(): XyoBoundWitnessJson {
    return {
      addresses: assertEx(this._addresses, 'Missing addresses'),
      payload_hashes: assertEx(this._payload_hashes, 'Missing payload_hashes'),
      previous_hashes: assertEx(this._previous_hashes, 'Missing previous_hashes'),
    }
  }

  public build(): XyoBoundWitnessJson {
    const hashableFields = this.hashableFields()
    const _hash = Builder.hash(hashableFields)
    return { ...hashableFields, _client: 'js', _hash }
  }

  static sortObject<T extends Record<string, any>>(obj: T) {
    if (obj === null) {
      return null
    }
    const result: Record<string, any> = {} as Record<string, any>
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        if (Array.isArray(obj[key])) {
          result[key] = obj[key]
        } else if (typeof obj[key] === 'object') {
          result[key] = Builder.sortObject(obj[key])
        } else {
          result[key] = obj[key]
        }
      })
    return result as T
  }

  static stringify<T extends Record<string, any>>(obj: T) {
    const sortedEntry = this.sortObject<T>(obj)
    return JSON.stringify(sortedEntry)
  }

  static hash<T extends Record<string, any>>(obj: T) {
    const stringObject = Builder.stringify<T>(obj)
    const hash = shajs('sha256').update(stringObject).digest('hex')
    return hash
  }
}

export default Builder
