import Ajv, { ValidateFunction } from 'ajv'

import dappPackageManifestSchema from '../dapp-package-manifest-schema.json'
// eslint-disable-next-line import/no-internal-modules
import sharedDefinitions from '../shared/definitions-schema.json'
import { invalidDappPackageManifestSchema, validDappPackageManifestSchema } from './cases'

describe('DappPackageManifestSchemas', () => {
  let validate: ValidateFunction | undefined

  beforeEach(() => {
    const ajv = new Ajv({ allErrors: true, schemas: [sharedDefinitions], strict: true })
    validate = ajv.compile(dappPackageManifestSchema)
  })
  it('valid schema', () => {
    if (validate) {
      const valid = validate(validDappPackageManifestSchema)
      // console.log(validate?.errors)
      expect(valid).toBe(true)
    } else {
      throw new Error('Schema did not compile successfully')
    }
  })
  it('invalid schema', () => {
    if (validate) {
      const valid = validate(invalidDappPackageManifestSchema)
      // console.log(validate?.errors)
      expect(valid).toBe(false)
      expect(validate.errors?.length).toBe(4)
    } else {
      throw new Error('Schema did not compile successfully')
    }
  })
})
