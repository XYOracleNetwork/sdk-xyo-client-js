import type { Payload, StorageMeta } from '@xyo-network/payload-model'

export interface PayloadMongoMeta extends StorageMeta {
  __archive?: string
  __client?: string
  __observeDuration?: number
  __schemaValid?: boolean
  __sources?: Payload[]
  __timestamp: number
  __user_agent?: string
}
