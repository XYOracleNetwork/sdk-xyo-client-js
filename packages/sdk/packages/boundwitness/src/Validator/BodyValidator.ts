import { XyoHasher, XyoValidatorBase } from '@xyo-network/core'
import { XyoPayload, XyoSchemaNameValidator } from '@xyo-network/payload'
import { validateType } from '@xyo-network/typeof'
import uniq from 'lodash/uniq'

import { XyoBoundWitness, XyoBoundWitnessSchema } from '../models'

export class XyoBoundWitnessBodyValidator<T extends XyoBoundWitness = XyoBoundWitness> extends XyoValidatorBase<T> {
  private payloads?: XyoPayload[]
  constructor(boundWitness: T, payloads?: XyoPayload[]) {
    super(boundWitness)
    this.payloads = payloads
  }

  public addressesUniqueness() {
    const errors: Error[] = []
    const { addresses } = this.obj
    const uniqAddresses = uniq(addresses)
    if (addresses?.length !== uniqAddresses?.length) errors.push(new Error('addresses must be unique'))
    return errors
  }

  public addresses() {
    const errors: Error[] = []
    const { addresses } = this.obj
    if (!addresses?.length) errors.push(new Error('addresses missing [at least one address required]'))
    errors.push(...this.addressesUniqueness())
    return errors
  }

  private validateArrayLength(fieldName: string, compareArrayName: string) {
    const errors: Error[] = []

    const [array, arrayErrors] = validateType('array', this.stringKeyObj[fieldName] as [], true)
    const [compareArray, compareArrayErrors] = validateType('array', this.stringKeyObj[compareArrayName] as [], true)

    if (array?.length !== compareArray?.length) {
      errors.push(new Error(`${fieldName}/${compareArrayName} count mismatch [${array?.length} !== ${compareArray?.length}]`))
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
    const passedHashes = this.obj.payload_hashes
    this.payloads?.forEach((payload, index) => {
      const calcHash = new XyoHasher(payload).hash
      const passedHash = passedHashes?.[index]
      if (calcHash !== passedHash) {
        errors.push(new Error(`hash mismatch [${calcHash} !== ${passedHash}]`))
      }
    })
    return errors
  }

  public Schemas() {
    const errors: Error[] = []
    const Schemas = this.obj.payload_schemas
    if (Schemas) {
      const schemaValidators: XyoSchemaNameValidator[] = Schemas.map((schema: string) => {
        return new XyoSchemaNameValidator(schema)
      })
      schemaValidators.forEach((validator) => {
        errors.push(...validator.all())
      })
    }
    return errors
  }

  public previousHashes() {
    const errors: Error[] = []
    return errors
  }

  public schema() {
    const errors: Error[] = []
    const expectedSchema = XyoBoundWitnessSchema
    if (this.obj.schema !== expectedSchema) {
      errors.push(new Error(`invalid schema [${expectedSchema} !== ${this.obj.schema}]`))
    }
    return errors
  }

  public validate() {
    const errors: Error[] = []
    errors.push(
      ...this.addresses(),
      ...this.validateArrayLengths(),
      ...this.payloadHashes(),
      ...this.Schemas(),
      ...this.previousHashes(),
      ...this.schema(),
    )
    return errors
  }
}
