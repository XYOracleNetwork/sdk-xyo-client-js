import { AbstractDirectDiviner } from '@xyo-network/abstract-diviner'
import { SchemaListDivinerParams } from '@xyo-network/diviner-schema-list-model'

export abstract class SchemaListDiviner<TParams extends SchemaListDivinerParams = SchemaListDivinerParams> extends AbstractDirectDiviner<TParams> {}
