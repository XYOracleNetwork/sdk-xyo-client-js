import type { EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'

export type ClearedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<T>

export interface ClearedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  cleared: ClearedEventArgs<T>
}
