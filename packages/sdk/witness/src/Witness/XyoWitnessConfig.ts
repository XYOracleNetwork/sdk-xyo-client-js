import { XyoModuleConfig } from '@xyo-network/module'

import { XyoWitnessQueryPayload } from './XyoWitnessQueryPayload'

export interface XyoWitnessConfig<Q extends XyoWitnessQueryPayload = XyoWitnessQueryPayload> extends XyoModuleConfig {
  query?: Q
}
