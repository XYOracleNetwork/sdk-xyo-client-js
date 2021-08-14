import uniq from 'lodash/uniq'

import { WithStringIndex, XyoBoundWitnessBody } from '../../models'
import SchemaValidator from '../../SchemaValidator'

class BodyValidator {
  private body: WithStringIndex<XyoBoundWitnessBody>
  constructor(body: XyoBoundWitnessBody) {
    this.body = body as WithStringIndex<XyoBoundWitnessBody>
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

  private validateArrayLength(fieldName: string) {
    const errors: Error[] = []
    const { addresses } = this.body
    const array = this.body[fieldName] as unknown[]
    if (array == undefined) errors.push(new Error(`${fieldName} missing`))
    else if (array.length !== addresses.length)
      errors.push(new Error(`${fieldName}/addresses count mismatch [${array.length} !== ${addresses.length}]`))
    return errors
  }

  public validatePayloadHashesLength() {
    const errors: Error[] = []
    errors.push(...this.validateArrayLength('payload_hashes'))
    return errors
  }

  public validatePayloadSchemasLength() {
    const errors: Error[] = []
    errors.push(...this.validateArrayLength('payload_schemas'))
    return errors
  }

  public validatePreviousHashesLength() {
    const errors: Error[] = []
    errors.push(...this.validateArrayLength('previous_hashes'))
    return errors
  }

  public validateArrayLengths() {
    const errors: Error[] = []
    errors.push(
      ...this.validatePayloadSchemasLength(),
      ...this.validatePayloadHashesLength(),
      ...this.validatePreviousHashesLength()
    )
    return errors
  }

  public payloadHashes() {
    const errors: Error[] = []
    const schemaValidators = this.body.payload_schemas.map((schema) => {
      return new SchemaValidator(schema)
    })
    schemaValidators.forEach((validator) => {
      errors.push(...validator.all())
    })
    return errors
  }

  public payloadSchemas() {
    const errors: Error[] = []
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

export default BodyValidator
