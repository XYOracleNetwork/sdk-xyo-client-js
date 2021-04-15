import { assertEx } from '@xyo-network/sdk-xyo-js'
import shajs from 'sha.js'

import { XyoAddressedEntryJson, XyoHashedEntryJson } from './models'

class XyoEntryBuilder {
  private _schema?: string
  private _addresses?: string[]

  public schema(schema: string) {
    this._schema = schema
    return this
  }

  public addresses(addresses: string[]) {
    this._addresses = addresses
    return this
  }

  public build(): XyoHashedEntryJson {
    const body: XyoAddressedEntryJson = {
      addresses: assertEx(this._addresses, 'Missing addresses'),
      schema: assertEx(this._schema, 'Missing schema'),
      timestamp: Date.now(),
    }

    assertEx(body.addresses.length > 0, 'Invalid address array length')

    return { ...body, hash: XyoEntryBuilder.hash(body) }
  }

  static sortObject<T extends Record<string, any>>(obj: T) {
    const result: Record<string, any> = {} as Record<string, any>
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        result[key] = obj[key]
      })
    return result as T
  }

  static hash(entry: XyoAddressedEntryJson) {
    const sortedEntry = this.sortObject<XyoAddressedEntryJson>(entry)
    const stringObject = JSON.stringify(sortedEntry)
    return shajs('sha256').update(stringObject).digest('hex')
  }
}

export default XyoEntryBuilder
