import type { EventEmitter } from 'node:stream'

import type { Job } from './Job.ts'

/** @internal */
export interface DefineOptions {
  lockLifetime?: number
}

/** @internal */
export interface JobQueue extends EventEmitter {
  define: (name: string, options: DefineOptions, processor: Job['task']) => void
  every: (
    interval: string,
    names: string | string[],
    //  data?: any,
    //  options?: JobOptions
  ) => Promise<void>
  start: () => Promise<unknown>
}
