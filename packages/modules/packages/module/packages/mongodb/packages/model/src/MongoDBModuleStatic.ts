import type { MongoDBStorageClassLabels } from './Labels.ts'

export interface MongoDBModuleStatic<T extends MongoDBStorageClassLabels = MongoDBStorageClassLabels> {
  labels: T
}
