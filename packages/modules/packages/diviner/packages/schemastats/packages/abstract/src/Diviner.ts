import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { SchemaStatsDivinerParams } from '@xyo-network/diviner-schema-stats-model'

export abstract class SchemaStatsDiviner<TParams extends SchemaStatsDivinerParams = SchemaStatsDivinerParams> extends AbstractDiviner<TParams> {}
