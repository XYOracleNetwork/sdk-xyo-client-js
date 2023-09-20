import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { EnvironmentSchema } from './Schema'

export const EnvironmentSubsetSchema = `${EnvironmentSchema}.subset`
export type EnvironmentSubsetSchema = typeof EnvironmentSubsetSchema

export type EnvironmentSubset = Payload<{ values: string[] }, EnvironmentSubsetSchema>

export const isEnvironmentSubsetPayload = isPayloadOfSchemaType<EnvironmentSubset>(EnvironmentSubsetSchema)
