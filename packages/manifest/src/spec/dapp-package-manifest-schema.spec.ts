import Ajv, { ValidateFunction } from 'ajv'

import dappPackageManifestSchema from '../dapp-package-manifest-schema.json'
// eslint-disable-next-line import/no-internal-modules
import sharedDefinitions from '../shared/definitions-schema.json'
import { invalidDappPackageManifestSchema, validDappPackageManifestSchema } from './cases/dappManifest'

const cases = [
  {
    describeName: 'DappPackageManifestSchema',
    invalidCase: invalidDappPackageManifestSchema,
    schemaToTest: dappPackageManifestSchema,
    validCase: validDappPackageManifestSchema,
  },
]

describe.each(cases)('ManifestSchemas', ({ describeName, validCase, invalidCase, schemaToTest }) => {
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
        expect(valid).toBe(false)
        expect(validate.errors?.length).toBe(4)
      } else {
        throw new Error('Schema did not compile successfully')
      }
    })
  })
})
