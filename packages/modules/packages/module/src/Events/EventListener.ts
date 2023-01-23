import { EventArgs } from './EventArgs'

export type EventListener<T extends EventArgs = undefined> = (args: T) => void
