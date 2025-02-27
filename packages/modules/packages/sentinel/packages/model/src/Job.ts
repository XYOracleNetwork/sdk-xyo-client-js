import type { ResolvedTask } from './ResolvedTask.ts'

export interface SentinelJob {
  tasks: ResolvedTask[][]
}
