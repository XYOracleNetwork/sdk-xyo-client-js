import { EmptyObject } from '@xyo-network/core'

import { EventListener } from './EventListener'

export interface ModuleEventEmitter<TEvent extends string, TEventArgs extends EmptyObject = EmptyObject> {
  on(event: TEvent, handler: EventListener<TEventArgs>): this
}
