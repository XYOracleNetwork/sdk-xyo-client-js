import uniq from 'lodash/uniq'

import { validateType } from '../../lib'
import { WithStringIndex, XyoBoundWitnessBody, XyoPayload } from '../../models'
import { XyoPayloadWrapper } from '../../Payload'
import { SchemaValidator } from '../../SchemaNameValidator'

class XyoBoundWitnessBodyValidator {
  private body: WithStringIndex<XyoBoundWitnessBody>
  private payloads?: XyoPayload[]
  constructor(body: XyoBoundWitnessBody, payloads?: XyoPayload[]) {
    this.body = body as WithStringIndex<XyoBoundWitnessBody>
    this.payloads = payloads
  }

  public addressesUniqueness() {
    const errors: Error[] = []
    const { addresses } = this.body
    const uniqAddresses = uniq(addresses)
    if (addresses.length !== uniqAddresses.length) errors.push(new Error('addresses must be unique'))
    return errors
  }

  public addresses() {
    const errors: Error[] = []
    const { addresses } = this.body
    if (addresses.length === 0) errors.push(new Error('addresses missing [at least one address required]'))
    errors.push(...this.addressesUniqueness())
    return errors
  }

  private validateArrayLength(fieldName: string, compareArrayName: string) {
    const errors: Error[] = []

    const [array, arrayErrors] = validateType('array', this.body[fieldName] as [], true)
    const [compareArray, compareArrayErrors] = validateType('array', this.body[compareArrayName] as [], true)

    if (array?.length !== compareArray?.length) {
      errors.push(
        new Error(`${fieldName}/${compareArrayName} count mismatch [${array?.length} !== ${compareArray?.length}]`)
      )
    }

    return [...arrayErrors, ...compareArrayErrors, ...errors]
  }

  public validatePayloadHashesLength() {
    const errors: Error[] = []
    errors.push(...this.validateArrayLength('payload_hashes', 'payload_schemas'))
    return errors
  }

  public validateArrayLengths() {
    const errors: Error[] = []
    errors.push(...this.validatePayloadHashesLength())
    return errors
  }

  public payloadHashes() {
    const errors: Error[] = []
    const passedHashes = this.body.payload_hashes
    this.payloads?.forEach((payload, index) => {
      const wrapper = new XyoPayloadWrapper(payload)
      const calcHash = wrapper.sortedHash()
      const passedHash = passedHashes[index]
      if (calcHash !== passedHash) {
        errors.push(new Error(`hash mismatch [${calcHash} !== ${passedHash}]`))
      }
    })
    return errors
  }

  public payloadSchemas() {
    const errors: Error[] = []
    const schemaValidators: SchemaValidator[] = this.body.payload_schemas.map((schema: string) => {
      return new SchemaValidator(schema)
    })
    schemaValidators.forEach((validator) => {
      errors.push(...validator.all())
    })
    return errors
  }

  public previousHashes() {
    const errors: Error[] = []
    return errors
  }

  public all() {
    const errors: Error[] = []
    errors.push(
      ...this.addresses(),
      ...this.validateArrayLengths(),
      ...this.payloadHashes(),
      ...this.payloadSchemas(),
      ...this.previousHashes()
    )
    return errors
  }
}

export { XyoBoundWitnessBodyValidator }
