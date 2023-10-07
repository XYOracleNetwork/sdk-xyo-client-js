import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { WitnessConfig } from '@xyo-network/witness-model'

export type CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'
export const CurrentLocationWitnessConfigSchema: CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'

export type CurrentLocationWitnessConfig = WitnessConfig<{
  schema: CurrentLocationWitnessConfigSchema
}>

export type CurrentLocationWitnessParams = ModuleParams<AnyConfigSchema<CurrentLocationWitnessConfig>, { geolocation?: Geolocation }>
