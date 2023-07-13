import { AbstractDirectDiviner } from '@xyo-network/abstract-diviner'
import { SchemaStatsDivinerParams } from '@xyo-network/diviner-schema-stats-model'

export abstract class SchemaStatsDiviner<
  TParams extends SchemaStatsDivinerParams = SchemaStatsDivinerParams,
> extends AbstractDirectDiviner<TParams> {}
