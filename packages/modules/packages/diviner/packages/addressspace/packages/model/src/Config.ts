import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import { AddressSpaceSchema } from './Schema.ts'

export const AddressSpaceDivinerConfigSchema = asSchema(`${AddressSpaceSchema}.diviner.config`, true)
export type AddressSpaceDivinerConfigSchema = typeof AddressSpaceDivinerConfigSchema

export type AddressSpaceDivinerConfig = DivinerConfig<{
  address?: string
  schema: AddressSpaceDivinerConfigSchema
}>

export const AddressSpaceBatchDivinerConfigSchema = asSchema(`${AddressSpaceSchema}.batch.diviner.config`, true)
export type AddressSpaceBatchDivinerConfigSchema = typeof AddressSpaceBatchDivinerConfigSchema

export type AddressSpaceBatchDivinerConfig = DivinerConfig<{
  address?: string
  schema: AddressSpaceBatchDivinerConfigSchema
}>
