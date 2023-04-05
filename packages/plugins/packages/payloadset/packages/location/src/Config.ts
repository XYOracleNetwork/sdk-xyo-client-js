import { AnyConfigSchema, ModuleParams } from '@xyo-network/module'
import { WitnessConfig } from '@xyo-network/witness'

export type CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'
export const CurrentLocationWitnessConfigSchema: CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'

export type CurrentLocationWitnessConfig = WitnessConfig<{
  schema: CurrentLocationWitnessConfigSchema
}>

export type CurrentLocationWitnessParams = ModuleParams<AnyConfigSchema<CurrentLocationWitnessConfig>, { geolocation?: Geolocation }>
