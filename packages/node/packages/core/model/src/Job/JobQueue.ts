import { Task } from '@xyo-network/shared'
import { EventEmitter } from 'stream'

export interface DefineOptions {
  lockLifetime?: number
}

export interface JobQueue extends EventEmitter {
  define: (name: string, options: DefineOptions, processor: Task) => void
  every: (
    interval: string,
    names: string | string[],
    //  data?: any,
    //  options?: JobOptions
  ) => Promise<void>
  start: () => Promise<unknown>
}
