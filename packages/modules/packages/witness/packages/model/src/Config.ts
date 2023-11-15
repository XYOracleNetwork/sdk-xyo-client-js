import { ModuleConfig } from '@xyo-network/module-model'
import { Payload, PayloadSetPayload } from '@xyo-network/payload-model'

export type WitnessConfigSchema = 'network.xyo.witness.config'
export const WitnessConfigSchema: WitnessConfigSchema = 'network.xyo.witness.config'

export interface WitnessConfigFields {
  archivist?: string
  targetSet?: PayloadSetPayload
}

export type WitnessConfig<TAdditional extends Omit<Payload, 'schema'> | void = void, TSchema extends string | void = void> = ModuleConfig<
  WitnessConfigFields & TAdditional & { schema: TSchema extends void ? (TAdditional extends void ? string : WitnessConfigSchema) : TSchema }
>
