import type { Payload } from '@xyo-network/payload-model'

import { AddressChainSchema } from './Schema.ts'

export type AddressChainPayload = Payload<{ schema: AddressChainSchema }>
export const isAddressChainPayload = (x?: Payload | null): x is AddressChainPayload => x?.schema === AddressChainSchema
