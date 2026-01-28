import { HashZod } from '@xylabs/sdk-js'
import {
  zodAsFactory, zodIsFactory, zodToFactory,
} from '@xylabs/zod'
import z from 'zod'

import { PayloadZodLoose, PayloadZodOfSchema } from './PayloadZod.ts'
import { asSchema } from './Schema.ts'

// payload that wraps a complete boundwitness with its payloads for use in systems such as submission queues
export const PayloadBundleSchema = asSchema('network.xyo.payload.bundle', true)
export type PayloadBundleSchema = typeof PayloadBundleSchema

export const PayloadBundleFieldsZod = z.object({
  payloads: PayloadZodLoose.array(),
  root: HashZod,
})

export type PayloadBundleFields = z.infer<typeof PayloadBundleFieldsZod>

export const PayloadBundleZod = PayloadZodOfSchema(PayloadBundleSchema).extend(PayloadBundleFieldsZod.shape)

export type PayloadBundle = z.infer<typeof PayloadBundleZod>

export const isPayloadBundle = zodIsFactory(PayloadBundleZod)
export const asPayloadBundle = zodAsFactory(PayloadBundleZod, 'asPayloadBundle')
export const asOptionalPayloadBundle = zodToFactory(PayloadBundleZod, 'asPayloadBundle')
