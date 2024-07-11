import { Job } from './Job.js'

export interface JobProvider {
  get jobs(): Job[]
}
