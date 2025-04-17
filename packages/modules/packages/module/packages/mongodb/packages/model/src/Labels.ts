import type { Labels } from '@xyo-network/module-model'

export interface MongoDBStorageClassLabels extends Labels {
  'network.xyo.storage.class': 'mongodb'
}

export const MongoDBStorageClassLabels: MongoDBStorageClassLabels = { 'network.xyo.storage.class': 'mongodb' }
