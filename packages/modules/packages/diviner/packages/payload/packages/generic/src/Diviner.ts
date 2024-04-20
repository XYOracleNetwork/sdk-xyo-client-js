import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import { Hash } from '@xylabs/hex'
import { EmptyObject } from '@xylabs/object'
import { ArchivistInstance, ArchivistModuleEventData } from '@xyo-network/archivist-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, Order, PayloadDivinerParams, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { EventListener } from '@xyo-network/module-events'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, Schema, WithMeta } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

const DEFAULT_INDEX_BATCH_SIZE = 100 as const
const DEFAULT_MAX_INDEX_SIZE = 8000 as const

export const GenericPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.generic.config' as const
export type GenericPayloadDivinerConfigSchema = typeof GenericPayloadDivinerConfigSchema

export class GenericPayloadDiviner<
  TParams extends PayloadDivinerParams = PayloadDivinerParams,
  TIn extends PayloadDivinerQueryPayload = PayloadDivinerQueryPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas: Schema[] = [...super.configSchemas, GenericPayloadDivinerConfigSchema]
  static override defaultConfigSchema: Schema = GenericPayloadDivinerConfigSchema

  protected payloadPairs: [WithMeta<TOut>, Hash][] = []

  private _archivistInstance?: ArchivistInstance
  private _indexOffset?: Hash
  private _updatePayloadPairsMutex = new Mutex()

  protected get indexBatchSize() {
    return this.config.indexBatchSize ?? DEFAULT_INDEX_BATCH_SIZE
  }

  protected get maxIndexSize() {
    return this.config.maxIndexSize ?? DEFAULT_MAX_INDEX_SIZE
  }

  protected all(order: Order = 'asc', offset?: Hash) {
    return order === 'asc' ? this.allAsc(offset) : this.allDesc(offset)
  }

  protected allAsc(offset?: Hash) {
    const pairs = this.payloadPairs
    const startIndex = (offset ? pairs.findIndex(([, hash]) => hash === offset) ?? -1 : -1) + 1
    return this.payloadPairs.slice(startIndex).map(([payload]) => payload)
  }

  protected allDesc(offset?: Hash) {
    const pairs = this.payloadPairs.reverse()
    const startIndex = (offset ? pairs.findIndex(([, hash]) => hash === offset) ?? -1 : -1) + 1
    return this.payloadPairs.slice(startIndex).map(([payload]) => payload)
  }

  protected override async archivistInstance(): Promise<ArchivistInstance | undefined>
  protected override async archivistInstance(required: true): Promise<ArchivistInstance>
  protected override async archivistInstance(required = false): Promise<ArchivistInstance | undefined> {
    if (!this._archivistInstance) {
      const archivist = await super.archivistInstance()
      if (required && !archivist) {
        throw new Error('Failed to find archivist')
      }
      archivist?.on('inserted', this.onArchivistInsert)
      this._archivistInstance = archivist
    }
    return this._archivistInstance
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<WithMeta<TOut>[]> {
    const filters = payloads?.filter(isPayloadDivinerQueryPayload) ?? []
    assertEx(filters.length < 2, () => 'Multiple PayloadDivinerQuery payloads may not be specified')
    const filter = assertEx(filters.shift(), () => 'No PayloadDivinerQuery specified') as unknown as WithMeta<
      PayloadDivinerQueryPayload<EmptyObject, Hash>
    >

    await this.updateIndex()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $hash, $meta, schema, schemas, order, limit, offset, ...props } = filter
    let all: WithMeta<TOut>[] = this.all(order, offset)
    if (all) {
      if (schemas?.length) all = all.filter((payload) => schemas.includes(payload.schema))
      if (Object.keys(props).length > 0) {
        const additionalFilterCriteria = Object.entries(props)
        for (const [prop, filter] of additionalFilterCriteria) {
          const property = prop as keyof TOut
          all =
            Array.isArray(filter) ?
              all.filter((payload) =>
                filter.every((value) => {
                  const prop = payload?.[property]
                  //TODO: This seems to be written just to check arrays, and now that $meta is there, need to check type?
                  return Array.isArray(prop) && prop.includes?.(value)
                }),
              )
            : all.filter((payload) => payload?.[property] === filter)
        }
      }
      return limit ? all.slice(0, limit) : all
    } else {
      throw new Error('Archivist does not support "all"')
    }
  }

  protected onArchivistInsert: EventListener<ArchivistModuleEventData['inserted']> = () => {
    //forget(this.indexPayloads(payloads as WithMeta<TOut>[]))
    forget(this.updateIndex())
  }

  protected override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    const archivist = await this.archivistInstance(true)
    archivist.off('inserted', this.onArchivistInsert)
    return await super.stopHandler()
  }

  //index any new payloads
  protected async updateIndex() {
    await this._updatePayloadPairsMutex.runExclusive(async () => {
      const archivist = await this.archivistInstance(true)
      let newPayloads = (await archivist.next({ limit: 100, offset: this._indexOffset })) as WithMeta<TOut>[]
      while (newPayloads.length > 0) {
        const prevOffset = this._indexOffset
        this._indexOffset = await PayloadBuilder.hash(assertEx(newPayloads.at(-1)))
        if (this._indexOffset === prevOffset) {
          this.logger.warn('next offset not found', prevOffset)
        }
        assertEx(this.payloadPairs.length + newPayloads.length <= this.maxIndexSize, () => 'maxIndexSize exceeded')
        await this.indexPayloads(newPayloads)
        newPayloads = (await archivist.next({ limit: 100, offset: this._indexOffset })) as WithMeta<TOut>[]
      }
    })
  }

  private async indexPayloads(payloads: WithMeta<TOut>[]): Promise<Hash> {
    const pairs = await PayloadBuilder.hashPairs(payloads)
    this.payloadPairs.push(...pairs)
    return assertEx(pairs.at(-1))[1]
  }
}
