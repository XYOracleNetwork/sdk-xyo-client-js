import { uniq } from '@xylabs/lodash'
import { AddressValue } from '@xyo-network/account'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { validateType } from '@xyo-network/typeof'

const validateArraysSameLength = (a: unknown[], b: unknown[], message = 'Array length mismatch') => {
  return a.length != b.length ? [Error(`${message} []`)] : []
}

export class BoundWitnessValidator<T extends BoundWitness<{ schema: string }> = BoundWitness> extends PayloadValidator<T> {
  protected get expectedSchema(): string {
    return BoundWitnessSchema
  }

  static validateSignature(hash: string, address: string, signature?: string): Error[] {
    if (!signature) {
      return [Error(`Missing signature [${address}]`)]
    }
    if (!new AddressValue(address).verify(hash, signature)) {
      return [Error(`Invalid signature [${address}] [${signature}]`)]
    }
    return []
  }

  addresses(): Error[] {
    const errors: Error[] = []
    //const { addresses } = this.obj
    //if (!addresses?.length) errors.push(new Error('addresses missing [at least one address required]'))
    errors.push(...this.addressesUniqueness())
    return errors
  }

  addressesUniqueness(): Error[] {
    const errors: Error[] = []
    const { addresses } = this.obj
    const uniqAddresses = uniq(addresses)
    if (addresses?.length !== uniqAddresses?.length) errors.push(Error('addresses must be unique'))
    return errors
  }

  previousHashes() {
    const errors: Error[] = []
    return errors
  }

  schema(): Error[] {
    const errors: Error[] = []
    if (this.obj.schema !== this.expectedSchema) {
      errors.push(Error(`invalid schema [${this.expectedSchema} !== ${this.obj.schema}]`))
    }
    return errors
  }

  schemas(): Error[] {
    const errors: Error[] = []
    const Schemas = this.obj.payload_schemas
    if (Schemas) {
      const schemaValidators = Schemas.map((schema: string) => {
        return PayloadValidator.schemaNameValidatorFactory?.(schema)
      })
      schemaValidators.forEach((validator) => {
        if (validator) {
          errors.push(...validator.all())
        }
      })
    }
    return errors
  }

  async signatures(): Promise<Error[]> {
    return [
      ...validateArraysSameLength(this.obj._signatures ?? [], this.obj.addresses, 'Length mismatch: address/_signature'),
      ...(
        await Promise.all(
          this.obj.addresses.map<Promise<Error[]>>(
            async (address, index) =>
              BoundWitnessValidator.validateSignature(await PayloadHasher.hashAsync(this.payload), address, this.obj._signatures?.[index]),
            [],
          ),
        )
      ).flat(),
    ]
  }

  override async validate() {
    return [
      ...(await this.signatures()),
      ...this.addresses(),
      ...this.validateArrayLengths(),
      ...this.schemas(),
      ...this.previousHashes(),
      ...this.schema(),
      ...(await super.validate()),
    ]
  }

  validateArrayLengths(): Error[] {
    const errors: Error[] = []
    errors.push(...this.validatePayloadHashesLength())
    return errors
  }

  validatePayloadHashesLength(): Error[] {
    const errors: Error[] = []
    errors.push(...this.validateArrayLength('payload_hashes', 'payload_schemas'))
    return errors
  }

  private validateArrayLength(fieldName: string, compareArrayName: string): Error[] {
    const errors: Error[] = []

    const [array, arrayErrors] = validateType('array', this.stringKeyObj[fieldName] as [], true)
    const [compareArray, compareArrayErrors] = validateType('array', this.stringKeyObj[compareArrayName] as [], true)

    if (array?.length !== compareArray?.length) {
      errors.push(new Error(`${fieldName}/${compareArrayName} count mismatch [${array?.length} !== ${compareArray?.length}]`))
    }

    return [...arrayErrors, ...compareArrayErrors, ...errors]
  }
}
