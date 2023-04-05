import { CreateIndexesOptions, IndexSpecification } from 'mongodb'

export type IndexCreationInfo = [string, IndexSpecification, CreateIndexesOptions]
