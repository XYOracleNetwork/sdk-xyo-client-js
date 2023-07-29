import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressSpaceSchema } from './Schema'

export type AddressSpaceDivinerConfigSchema = `${AddressSpaceSchema}.diviner.config`
export const AddressSpaceDivinerConfigSchema: AddressSpaceDivinerConfigSchema = `${AddressSpaceSchema}.diviner.config`

export type AddressSpaceDivinerConfig = DivinerConfig<{
  address?: string
  schema: AddressSpaceDivinerConfigSchema
}>

export type AddressSpaceBatchDivinerConfigSchema = `${AddressSpaceSchema}.batch.diviner.config`
export const AddressSpaceBatchDivinerConfigSchema: AddressSpaceBatchDivinerConfigSchema = `${AddressSpaceSchema}.batch.diviner.config`

export type AddressSpaceBatchDivinerConfig = DivinerConfig<{
  address?: string
  schema: AddressSpaceBatchDivinerConfigSchema
}>
