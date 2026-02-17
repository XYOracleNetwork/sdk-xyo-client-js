import type { CreatableInstance } from '@xylabs/sdk-js'

import type { ModuleEventData } from '../EventsModels/index.ts'
import type { QueryableModuleFields } from './QueryableModuleFields.ts'
import type { QueryableModuleParams } from './QueryableModuleParams.ts'

export interface QueryableModule<TParams extends QueryableModuleParams = QueryableModuleParams,
  TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  extends QueryableModuleFields<TParams>, CreatableInstance<TParams, TEventData> {
}

/** @deprecated use QueryableModule instead */
export interface Module<TParams extends QueryableModuleParams = QueryableModuleParams, TEventData extends ModuleEventData<object> = ModuleEventData<object>>
  extends QueryableModule<TParams, TEventData> {}
