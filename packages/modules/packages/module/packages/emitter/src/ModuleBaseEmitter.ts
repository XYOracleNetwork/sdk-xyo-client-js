import type { BaseParams, EventData } from '@xylabs/sdk-js'
import { BaseEmitter } from '@xylabs/sdk-js'

export class ModuleBaseEmitter<TParams extends BaseParams = BaseParams, TEventData extends EventData = EventData>
  extends BaseEmitter<TParams, TEventData> {}
