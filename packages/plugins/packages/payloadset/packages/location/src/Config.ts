import { ModuleParams } from '@xyo-network/module'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'
export const CurrentLocationWitnessConfigSchema: CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'

export type CurrentLocationWitnessConfig = XyoWitnessConfig<{
  schema: CurrentLocationWitnessConfigSchema
}>

export type CurrentLocationWitnessParams = ModuleParams<CurrentLocationWitnessConfig> & { geolocation: Geolocation }
