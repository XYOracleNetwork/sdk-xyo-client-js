import type { IndexDescription } from 'mongodb'

export type CollectionIndexFunction = (collectionName: string) => IndexDescription[]
