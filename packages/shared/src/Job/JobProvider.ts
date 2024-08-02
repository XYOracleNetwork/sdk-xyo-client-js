import { Job } from './Job.ts'

export interface JobProvider {
  get jobs(): Job[]
}
