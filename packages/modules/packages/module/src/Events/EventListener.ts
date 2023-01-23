import { EmptyObject } from '@xyo-network/core'

export type EventListener<T extends EmptyObject = EmptyObject> = (args: T) => void
