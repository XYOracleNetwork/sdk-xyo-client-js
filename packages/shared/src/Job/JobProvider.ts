import { Job } from './Job'

export interface JobProvider {
  get jobs(): Job[]
}
