import { assertEx } from '@xylabs/sdk-js'
import shajs from 'sha.js'

import { XyoAddress } from '../../Address'
import { XyoBoundWitness, XyoPayloadBody } from '../../models'
import { sortObject } from '../../sortObject'

interface IXyoBoundWitnessBuilderConfig {
  /** Whether or not the payloads should be included in the metadata sent to and recorded by the ArchivistApi */
  readonly inlinePayloads: boolean
}

class XyoBoundWitnessBuilder {
  private _addresses: XyoAddress[] = []
  private _previous_hashes: (string | null)[] = []
  private _payload_schemas: string[] = []
  private _payloads: Record<string, unknown>[] = []

  constructor(public readonly config: IXyoBoundWitnessBuilderConfig = { inlinePayloads: false }) {}

  private get _payload_hashes(): string[] {
    return this._payloads.map((payload) => {
      return XyoBoundWitnessBuilder.hash(payload)
    })
  }

  public witness(address: XyoAddress, previousHash: string | null) {
    this._addresses?.push(address)
    this._previous_hashes?.push(previousHash)
    return this
  }

  public payload(schema: string, payload: Record<string, unknown>) {
    this._payload_schemas.push(schema)
    this._payloads.push(assertEx(sortObject(payload)))
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
    const _hash = XyoBoundWitnessBuilder.hash(hashableFields)
    const ret = { ...hashableFields, _client: 'js', _hash } as XyoBoundWitness
    if (this.config.inlinePayloads) {
      ret._payloads = this._payloads.map<XyoPayloadBody>((payload, index) => {
        return {
          schema: this._payload_schemas[index],
          ...payload,
        }
      })
    }
    return ret
  }

  static sortedStringify<T extends Record<string, unknown>>(obj: T) {
    const sortedEntry = sortObject<T>(obj)
    return JSON.stringify(sortedEntry)
  }

  static hash<T extends Record<string, unknown>>(obj: T) {
    const stringObject = XyoBoundWitnessBuilder.sortedStringify<T>(obj)
    return shajs('sha256').update(stringObject).digest('hex')
  }
}

export { IXyoBoundWitnessBuilderConfig, XyoBoundWitnessBuilder }
