import type { QueryableModule } from '@xyo-network/module-model'

import type { BridgeModuleEventData } from './EventData.ts'
import type { BridgeParams } from './Params.ts'

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends QueryableModule<TParams, TEventData> {}
