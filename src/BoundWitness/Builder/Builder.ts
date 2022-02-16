import { assertEx, bufferPolyfill } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'

import { XyoAddress } from '../../Address'
import { sortFields, XyoHasher } from '../../Hasher'
import { XyoBoundWitness, XyoPayload, XyoPayloadBody } from '../../models'

export interface XyoBoundWitnessBuilderConfig {
  /** Whether or not the payloads should be included in the metadata sent to and recorded by the ArchivistApi */
  readonly inlinePayloads?: boolean
}

export class XyoBoundWitnessBuilder {
  private _addresses: XyoAddress[] = []
  private _payload_schemas: string[] = []
  private _payloads: XyoPayload[] = []

  constructor(public readonly config: XyoBoundWitnessBuilderConfig = { inlinePayloads: false }) {
    bufferPolyfill()
  }

  private get _payload_hashes(): string[] {
    return this._payloads.map((payload) => {
      return new XyoHasher(payload).sortedHash()
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
    this._payloads.push(assertEx(sortFields(payload)))
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
    const _hash = new XyoHasher(hashableFields).sortedHash()

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
}
