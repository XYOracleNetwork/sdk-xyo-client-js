import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { EnvironmentSchema } from './Schema.ts'

export const EnvironmentSubsetSchema = `${EnvironmentSchema}.subset` as const
export type EnvironmentSubsetSchema = typeof EnvironmentSubsetSchema

export type EnvironmentSubset = Payload<{ values: string[] }, EnvironmentSubsetSchema>

export const isEnvironmentSubsetPayload = isPayloadOfSchemaType<EnvironmentSubset>(EnvironmentSubsetSchema)
