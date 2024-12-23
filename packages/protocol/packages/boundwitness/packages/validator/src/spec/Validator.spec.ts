import '@xylabs/vitest-extended'

import type { WalletInstance } from '@xyo-network/account'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { Payload } from '@xyo-network/payload'
import { PayloadBuilder } from '@xyo-network/payload'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'
import { expect, test } from 'vitest'

import { BoundWitnessValidator } from '../Validator.ts'

const dumpErrors = (errors: Error[]) => {
  for (const error of errors) {
    console.log(error)
  }
}

test('valid', async () => {
  const wallet: WalletInstance = await HDWallet.random()
  const payload: Payload = { schema: 'network.xyo.test' }
  const [bw] = await new BoundWitnessBuilder().signers([wallet]).payloads([payload]).build()
  BoundWitnessValidator.setSchemaNameValidatorFactory(schema => new SchemaNameValidator(schema))
  const validator = new BoundWitnessValidator(bw)
  const errors = await validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('invalid', async () => {
  const wallet: WalletInstance = await HDWallet.random()
  const payload = { schema: 'network.xyo.test' }
  const [bw] = await new BoundWitnessBuilder().signers([wallet]).payloads([payload]).build()
  bw.payload_hashes.push(await PayloadBuilder.dataHash(bw)) // this should make it invalid
  bw.payload_schemas.push(bw.schema) // this should make it invalid
  BoundWitnessValidator.setSchemaNameValidatorFactory(schema => new SchemaNameValidator(schema))
  const validator = new BoundWitnessValidator(bw)
  const errors = await validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBeGreaterThan(0)
})
