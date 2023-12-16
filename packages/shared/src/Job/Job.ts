import { Task } from './Task'

export type VoidFunction = (...anyArguments: unknown[]) => void

export interface Job {
  name: string
  onComplete?: VoidFunction
  onFail?: VoidFunction
  onStart?: VoidFunction
  onSuccess?: VoidFunction
  schedule: string
  task: Task
}
