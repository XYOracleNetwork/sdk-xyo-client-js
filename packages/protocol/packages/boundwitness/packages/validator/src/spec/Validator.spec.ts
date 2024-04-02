import { HDWallet, WalletInstance } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'

import { BoundWitnessValidator } from '../Validator'

const dumpErrors = (errors: Error[]) => {
  for (const error of errors) {
    console.log(error, null, 2)
  }
}

test('all', async () => {
  const wallet: WalletInstance = await HDWallet.random()
  const payload: Payload = { schema: 'network.xyo.test' }
  const [bw] = await BoundWitnessBuilder.build({ accounts: [wallet], payloads: [payload] })
  console.log(`bw: ${JSON.stringify(bw, null, 2)}`)
  BoundWitnessValidator.setSchemaNameValidatorFactory((schema) => new SchemaNameValidator(schema))
  const validator = new BoundWitnessValidator(bw)
  const errors = await validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
