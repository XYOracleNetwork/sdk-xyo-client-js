import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressSpaceSchema } from './Schema'

export type AddressSpaceDivinerConfigSchema = `${AddressSpaceSchema}.config`
export const AddressSpaceDivinerConfigSchema: AddressSpaceDivinerConfigSchema = `${AddressSpaceSchema}.config`

export type AddressSpaceDivinerConfig = DivinerConfig<{
  address?: string
  schema: AddressSpaceDivinerConfigSchema
}>
