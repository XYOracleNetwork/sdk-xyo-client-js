import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const EnvironmentSubsetSchema = 'network.xyo.environment.subset'
export type EnvironmentSubsetSchema = typeof EnvironmentSubsetSchema

export type EnvironmentSubset = Payload<{ values: string[] }, EnvironmentSubsetSchema>

export const isEnvironmentSubsetPayload = isPayloadOfSchemaType<EnvironmentSubset>(EnvironmentSubsetSchema)
