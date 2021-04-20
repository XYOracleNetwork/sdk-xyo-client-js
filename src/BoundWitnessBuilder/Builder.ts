import { assertEx } from '@xyo-network/sdk-xyo-js'
import shajs from 'sha.js'

import { XyoBoundWitnessJson } from '../models'

class Builder<T> {
  private _addresses: string[] = []
  private _hashes: (string | null)[] = []

  public witness(address: string, previousHash: string | null) {
    this._addresses?.push(address)
    this._hashes?.push(previousHash)
    return this
  }

  public hashableFields(payload: T): XyoBoundWitnessJson<T> {
    return {
      addresses: assertEx(this._addresses, 'Missing addresses'),
      hashes: assertEx(this._hashes, 'Missing addresses'),
      payload,
    }
  }

  public build(payload: T): XyoBoundWitnessJson<T> {
    const hashableFields = this.hashableFields(payload)
    return { ...hashableFields, _hash: Builder.hash(hashableFields) }
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

  static stringify<T>(obj: T) {
    const sortedEntry = this.sortObject<T>(obj)
    return JSON.stringify(sortedEntry)
  }

  static hash<T>(obj: T) {
    const stringObject = Builder.stringify<T>(obj)
    return shajs('sha256').update(stringObject).digest('hex')
  }
}

export default Builder
