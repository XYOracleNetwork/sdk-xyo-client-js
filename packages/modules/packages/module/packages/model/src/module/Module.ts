import { EventFunctions } from '@xyo-network/module-events'

import { ModuleEventData } from '../EventsModels/index.ts'
import { ModuleParams } from '../ModuleParams.ts'
import { ModuleFields } from './ModuleFields.ts'

export interface Module<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  extends ModuleFields<TParams>,
    EventFunctions<TEventData> {}
