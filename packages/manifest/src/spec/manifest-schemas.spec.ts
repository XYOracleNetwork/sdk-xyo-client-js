import Ajv, { ValidateFunction } from 'ajv'

import dappPackageManifestSchema from '../dapp-package-manifest-schema.json'
import packageManifestSchema from '../schema.json'
// eslint-disable-next-line import/no-internal-modules
import sharedDefinitions from '../shared/definitions-schema.json'
import { invalidDappPackageManifestSchema, invalidPackageManifestSchema, validDappPackageManifestSchema, validPackageManifestSchema } from './cases'

const cases = [
  {
    describeName: 'PackageManifestSchema',
    expectedErrorCount: 3,
    invalidCase: invalidPackageManifestSchema,
    schemaToTest: packageManifestSchema,
    validCase: validPackageManifestSchema,
  },
  {
    describeName: 'DappPackageManifestSchema',
    expectedErrorCount: 4,
    invalidCase: invalidDappPackageManifestSchema,
    schemaToTest: dappPackageManifestSchema,
    validCase: validDappPackageManifestSchema,
  },
]

describe.each(cases)('ManifestSchemas', ({ describeName, expectedErrorCount, validCase, invalidCase, schemaToTest }) => {
  describe(describeName, () => {
    let validate: ValidateFunction | undefined

    beforeEach(() => {
      const ajv = new Ajv({ allErrors: true, schemas: [sharedDefinitions], strict: true })
      // see if you can export the super set
      validate = ajv.compile(schemaToTest)
      // validate.schema
    })
    it('valid schema', () => {
      if (validate) {
        const valid = validate(validCase)
        // console.log(validate?.errors)
        expect(valid).toBe(true)
      } else {
        throw new Error('Schema did not compile successfully')
      }
    })
    it('invalid schema', () => {
      if (validate) {
        const valid = validate(invalidCase)
        console.log(describeName, validate?.errors)
        expect(valid).toBe(false)
        expect(validate.errors?.length).toBe(expectedErrorCount)
      } else {
        throw new Error('Schema did not compile successfully')
      }
    })
  })
})
