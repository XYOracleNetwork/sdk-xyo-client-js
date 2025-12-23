import { uniq } from '@xylabs/array'
import { toArrayBuffer } from '@xylabs/arraybuffer'
import { asAddress, validateType } from '@xylabs/sdk-js'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { Elliptic } from '@xyo-network/elliptic'
import { PayloadBuilder } from '@xyo-network/payload'
import { PayloadValidator } from '@xyo-network/payload-validator'

const validateArraysSameLength = (a: unknown[], b: unknown[], message = 'Array length mismatch') => {
  return a.length == b.length ? [] : [new Error(`${message} []`)]
}

export class BoundWitnessValidator<T extends BoundWitness = BoundWitness> extends PayloadValidator<T> {
  protected get expectedSchema(): string {
    return BoundWitnessSchema
  }

  static async validateSignature(hash: ArrayBufferLike, address: ArrayBufferLike, signature?: ArrayBufferLike): Promise<Error[]> {
    if (!signature) {
      return [new Error(`Missing signature [${address}]`)]
    }
    if (!(await Elliptic.verify(hash, signature, address))) {
      return [new Error(`Invalid signature [${address}]`)]
    }
    return []
  }

  addresses(): Error[] {
    const errors: Error[] = [...this.addressesUniqueness()]
    // const { addresses } = this.obj
    // if (!addresses?.length) errors.push(new Error('addresses missing [at least one address required]'))
    return errors
  }

  addressesUniqueness(): Error[] {
    const errors: Error[] = []
    const { addresses = [] } = this.obj
    const uniqAddresses = uniq(addresses)
    if (addresses?.length !== uniqAddresses?.length) errors.push(new Error('addresses must be unique'))
    return errors
  }

  previousHashes() {
    const errors: Error[] = []
    return errors
  }

  schema(): Error[] {
    const errors: Error[] = []
    if (this.obj.schema !== this.expectedSchema) {
      errors.push(new Error(`invalid schema [${this.expectedSchema} !== ${this.obj.schema}]`))
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
      for (const validator of schemaValidators) {
        if (validator) {
          errors.push(...validator.all())
        }
      }
    }
    return errors
  }

  async signatures(): Promise<Error[]> {
    return [
      ...validateArraysSameLength(this.obj.$signatures ?? [], this.obj.addresses ?? [], 'Length mismatch: address/signature'),
      ...(
        await Promise.all(
          this.obj.addresses?.map<Promise<Error[]>>(async (address, index) =>
            BoundWitnessValidator.validateSignature(
              toArrayBuffer(await PayloadBuilder.dataHash(this.payload)),
              toArrayBuffer(asAddress(address, true)),
              toArrayBuffer(this.obj.$signatures?.[index] ?? undefined),
            )) ?? [],
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
    const errors: Error[] = [...this.validatePayloadHashesLength()]
    return errors
  }

  validatePayloadHashesLength(): Error[] {
    const errors: Error[] = [...this.validateArrayLength('payload_hashes', 'payload_schemas')]
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
