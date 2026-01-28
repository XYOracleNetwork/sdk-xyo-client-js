import type { Payload } from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { EnvironmentSchema } from './Schema.ts'

export const EnvironmentSubsetSchema = asSchema(`${EnvironmentSchema}.subset`, true)
export type EnvironmentSubsetSchema = typeof EnvironmentSubsetSchema

export type EnvironmentSubset = Payload<{ values: string[] }, EnvironmentSubsetSchema>

export const isEnvironmentSubsetPayload = isPayloadOfSchemaType<EnvironmentSubset>(EnvironmentSubsetSchema)
