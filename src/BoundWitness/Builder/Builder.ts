import { assertEx, bufferPolyfill } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'
import shajs from 'sha.js'

import { XyoAddress } from '../../Address'
import { XyoBoundWitness, XyoPayload, XyoPayloadBody } from '../../models'
import { sortObject } from '../../sortObject'

interface IXyoBoundWitnessBuilderConfig {
  /** Whether or not the payloads should be included in the metadata sent to and recorded by the ArchivistApi */
  readonly inlinePayloads: boolean
}

class XyoBoundWitnessBuilder {
  private _addresses: XyoAddress[] = []
  private _payload_schemas: string[] = []
  private _payloads: XyoPayload[] = []

  constructor(public readonly config: IXyoBoundWitnessBuilderConfig = { inlinePayloads: false }) {
    bufferPolyfill()
  }

  private get _payload_hashes(): string[] {
    return this._payloads.map((payload) => {
      return XyoBoundWitnessBuilder.hash(payload)
    })
  }

  public witness(address: XyoAddress) {
    this._addresses?.push(address)
    return this
  }

  public payloads(payloads: XyoPayload[]) {
    payloads.forEach((payload) => {
      this.payload(payload)
    })
    return this
  }

  public payload(payload: XyoPayload) {
    this._payload_schemas.push(payload.schema)
    this._payloads.push(assertEx(sortObject(payload)))
    return this
  }

  public hashableFields(): XyoBoundWitness {
    const addresses = this._addresses.map((address) => address.address)
    const previous_hashes = this._addresses.map((address) => address.previousHashString ?? null)
    return {
      addresses: assertEx(addresses, 'Missing addresses'),
      payload_hashes: assertEx(this._payload_hashes, 'Missing payload_hashes'),
      payload_schemas: assertEx(this._payload_schemas, 'Missing payload_schemas'),
      previous_hashes,
    }
  }

  public build(): XyoBoundWitness {
    const hashableFields = this.hashableFields() as unknown as Record<string, unknown>
    const _hash = XyoBoundWitnessBuilder.hash(hashableFields)

    const _signatures = this._addresses.map((address) =>
      Buffer.from(address.sign(Buffer.from(_hash, 'hex'))).toString('hex')
    )
    const _timestamp = Date.now()
    const ret = { ...hashableFields, _client: 'js', _hash, _signatures, _timestamp } as XyoBoundWitness
    if (this.config.inlinePayloads) {
      ret._payloads = this._payloads.map<XyoPayloadBody>((payload, index) => {
        return {
          ...payload,
          schema: this._payload_schemas[index],
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
