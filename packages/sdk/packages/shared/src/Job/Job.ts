import { Task } from './Task'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VoidFunction = (...args: any[]) => void

export interface Job {
  name: string
  onComplete?: VoidFunction
  onFail?: VoidFunction
  onStart?: VoidFunction
  onSuccess?: VoidFunction
  schedule: string
  task: Task
}
