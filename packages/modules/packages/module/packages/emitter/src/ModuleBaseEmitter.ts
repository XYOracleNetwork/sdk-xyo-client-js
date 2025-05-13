import type { BaseParams } from '@xylabs/base'
import { BaseEmitter, type EventData } from '@xylabs/events'

export class ModuleBaseEmitter<TParams extends BaseParams = BaseParams, TEventData extends EventData = EventData>
  extends BaseEmitter<TParams, TEventData> {}
