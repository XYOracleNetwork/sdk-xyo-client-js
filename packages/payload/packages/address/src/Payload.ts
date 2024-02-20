import { Address } from '@xylabs/hex'
import { Payload } from '@xyo-network/payload-model'

import { ModuleName } from '../../../../modules/packages/module/packages/model/dist/node'
import { AddressSchema } from './Schema'

export type AddressPayload = Payload<{
  address: Address
  name?: ModuleName
  schema: AddressSchema
}>
