import { AnyObject } from '@xyo-network/core'

export type Event = string

export type EventArgs<Args extends AnyObject = AnyObject> = Args
