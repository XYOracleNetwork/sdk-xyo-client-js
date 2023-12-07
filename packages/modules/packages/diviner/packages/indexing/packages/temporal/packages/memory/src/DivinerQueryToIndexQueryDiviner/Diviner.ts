import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import {
  SchemaToJsonPathTransformExpressionsDictionary,
  SchemaToPayloadTransformersDictionary,
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerParams,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { jsonPathToTransformersDictionary, reducePayloads } from '../jsonpath'

/**
 * A diviner that converts diviner query to index query
 */
export class TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner<
  TParams extends TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerParams = TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerParams,
> extends AbstractDiviner<TParams> {
  static override readonly configSchema = TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'divinerQueryToIndexQueryDiviner',
  }

  private _indexableSchemas: string[] | undefined
  private _payloadTransformers: SchemaToPayloadTransformersDictionary | undefined

  /**
   * The schema of the diviner query payloads
   */
  protected get divinerQuerySchema(): string {
    return this.config.divinerQuerySchema ?? PayloadDivinerQuerySchema
  }

  /**
   * The schema of the index query payloads
   */
  protected get indexQuerySchema(): string {
    return this.config.indexQuerySchema ?? PayloadDivinerQuerySchema
  }

  /**
   * The schema of the index payloads
   */
  protected get indexSchema(): string {
    return this.config.indexSchema ?? TemporalIndexingDivinerResultIndexSchema
  }

  /**
   * List of indexable schemas for this diviner
   */
  protected get indexableSchemas(): string[] {
    if (!this._indexableSchemas) this._indexableSchemas = [...Object.keys(this.schemaTransforms)]
    return this._indexableSchemas
  }

  /**
   * Dictionary of schemas to payload transformers for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get payloadTransformers(): SchemaToPayloadTransformersDictionary {
    if (!this._payloadTransformers) this._payloadTransformers = jsonPathToTransformersDictionary(this.schemaTransforms)
    return this._payloadTransformers
  }

  /**
   * The dictionary of schemas to JSON Path transform expressions for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get schemaTransforms(): SchemaToJsonPathTransformExpressionsDictionary {
    return (
      this.config?.schemaTransforms ?? {
        [this.divinerQuerySchema]: [
          {
            defaultValue: 1,
            destinationField: 'limit',
            sourcePathExpression: '$.limit',
          },
          {
            defaultValue: 0,
            destinationField: 'offset',
            sourcePathExpression: '$.offset',
          },
          {
            defaultValue: 'desc',
            destinationField: 'order',
            sourcePathExpression: '$.order',
          },
        ],
      }
    )
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const queries = payloads.filter(isPayloadOfSchemaType<PayloadDivinerQueryPayload>(this.divinerQuerySchema))
    if (queries.length) {
      const results = await Promise.all(
        queries.map(async (query) => {
          const fields = await reducePayloads<PayloadDivinerQueryPayload & { sources?: string[] }>(
            [query],
            this.payloadTransformers,
            this.indexQuerySchema,
          )
          // TODO: Make index schema configurable
          fields.schemas = [this.indexSchema]
          // TODO: Make sources not need to be deleted
          delete fields.sources
          // TODO: Add support for additional filters
          return new PayloadBuilder<Payload>({ schema: this.indexQuerySchema }).fields(fields).build()
        }),
      )
      return results
    }
    return Promise.resolve([])
  }
}
