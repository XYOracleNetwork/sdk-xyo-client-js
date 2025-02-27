import type { EventFunctions } from '@xyo-network/module-events'

import type { ModuleEventData } from '../EventsModels/index.ts'
import type { ModuleParams } from '../ModuleParams.ts'
import type { ModuleFields } from './ModuleFields.ts'

export interface Module<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  extends ModuleFields<TParams>,
  EventFunctions<TEventData> {}
