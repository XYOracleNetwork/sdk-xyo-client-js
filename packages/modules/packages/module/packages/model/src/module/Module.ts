import { EventFunctions } from '@xyo-network/module-events'

import { ModuleEventData } from '../EventsModels/index.js'
import { ModuleParams } from '../ModuleParams.js'
import { ModuleFields } from './ModuleFields.js'

export interface Module<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  extends ModuleFields<TParams>,
    EventFunctions<TEventData> {}
