import { ModuleInstance } from '@xyo-network/module-model'

import { SentinelTask } from './Task'

export type ResolvedSentinelTask = Omit<SentinelTask, 'module'> & {
  /** @field the modules that performs the task */
  module: ModuleInstance
}

export interface SentinelJob {
  tasks: ResolvedSentinelTask[][]
}
