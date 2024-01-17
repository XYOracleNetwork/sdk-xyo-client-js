import { EventFunctions } from '@xyo-network/module-events'

import { ModuleEventData } from '../EventsModels'
import { ModuleParams } from '../ModuleParams'
import { ModuleFields } from './ModuleFields'

export interface Module<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  extends ModuleFields<TParams>,
    EventFunctions<TEventData> {}
