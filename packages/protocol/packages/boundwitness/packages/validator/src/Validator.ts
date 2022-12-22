import { AddressValue } from '@xyo-network/account'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { Hasher } from '@xyo-network/core'
import { PayloadValidator, XyoSchemaNameValidator } from '@xyo-network/payload-validator'
import { validateType } from '@xyo-network/typeof'
import uniq from 'lodash/uniq'

const validateArraysSameLength = (a: unknown[], b: unknown[], message = 'Array length mismatch') => {
  return a.length != b.length ? [Error(`${message} []`)] : []
}

export class BoundWitnessValidator<T extends XyoBoundWitness<{ schema: string }> = XyoBoundWitness> extends PayloadValidator<T> {
  public get hash() {
    return new Hasher(this.obj).hash
  }

  static validateSignature(hash: string, address: string, signature?: string) {
    if (!signature) {
      return [Error(`Missing signature [${address}]`)]
    }
    if (!new AddressValue(address).verify(hash, signature)) {
      return [Error(`Invalid signature [${address}] [${signature}]`)]
    }
    return []
  }

  public addresses() {
    const errors: Error[] = []
    const { addresses } = this.obj
    if (!addresses?.length) errors.push(new Error('addresses missing [at least one address required]'))
    errors.push(...this.addressesUniqueness())
    return errors
  }

  public addressesUniqueness() {
    const errors: Error[] = []
    const { addresses } = this.obj
    const uniqAddresses = uniq(addresses)
    if (addresses?.length !== uniqAddresses?.length) errors.push(new Error('addresses must be unique'))
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

  public schemas() {
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

  public signatures() {
    return [
      ...validateArraysSameLength(this.obj._signatures ?? [], this.obj.addresses, 'Length mismatch: address/_signature'),
      ...this.obj.addresses.reduce<Error[]>((errors, address, index) => {
        errors.push(...BoundWitnessValidator.validateSignature(this.hash, address, this.obj._signatures?.[index]))
        return errors
      }, []),
    ]
  }

  public override validate() {
    return [
      ...this.signatures(),
      ...this.addresses(),
      ...this.validateArrayLengths(),
      ...this.schemas(),
      ...this.previousHashes(),
      ...this.schema(),
      ...super.validate(),
    ]
  }

  public validateArrayLengths() {
    const errors: Error[] = []
    errors.push(...this.validatePayloadHashesLength())
    return errors
  }

  public validatePayloadHashesLength() {
    const errors: Error[] = []
    errors.push(...this.validateArrayLength('payload_hashes', 'payload_schemas'))
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
}
