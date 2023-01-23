import { EmptyObject } from '@xyo-network/core'

export type EventListener<T extends EmptyObject | undefined = undefined> = (args: T) => void
