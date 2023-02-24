import { EventArgs } from './EventArgs'

export type EventListener<T extends EventArgs = EventArgs> = (args: T) => void
