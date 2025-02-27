import type { Job } from './Job.ts'

export interface JobProvider {
  get jobs(): Job[]
}
