import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import {
  type Hash, type Hex, toHex,
} from '@xylabs/hex'
import { type EmptyObject } from '@xylabs/object'
import type { ArchivistInstance, ArchivistModuleEventData } from '@xyo-network/archivist-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import type {
  Order,
  PayloadDivinerConfig,
  PayloadDivinerParams,
  PayloadDivinerQueryPayload,
} from '@xyo-network/diviner-payload-model'
import { isPayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import type { EventListener } from '@xyo-network/module-events'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  type Payload, type Schema, StorageMetaConstants,
  type WithStorageMeta,
} from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

const DEFAULT_INDEX_BATCH_SIZE = 100 as const
const DEFAULT_MAX_INDEX_SIZE = 8000 as const

export const GenericPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.generic.config' as const
export type GenericPayloadDivinerConfigSchema = typeof GenericPayloadDivinerConfigSchema

export type GenericPayloadDivinerConfig = PayloadDivinerConfig<
  {
    indexes?: string[]
  },
  GenericPayloadDivinerConfigSchema
>

export class GenericPayloadDiviner<
  TParams extends PayloadDivinerParams<GenericPayloadDivinerConfig> = PayloadDivinerParams<GenericPayloadDivinerConfig>,
  TIn extends PayloadDivinerQueryPayload<EmptyObject, Hash> = PayloadDivinerQueryPayload<EmptyObject, Hash>,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, GenericPayloadDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = GenericPayloadDivinerConfigSchema

  protected indexMaps: Record<string, WithStorageMeta<TOut>[]> = {}
  protected payloadsWithMeta: WithStorageMeta<TOut>[] = []

  private _archivistInstance?: ArchivistInstance
  private _cursor?: Hex
  private _updatePayloadPairsMutex = new Mutex()

  protected get indexBatchSize() {
    return this.config.indexBatchSize ?? DEFAULT_INDEX_BATCH_SIZE
  }

  protected get indexes(): string[] {
    return ['schema', ...(this.config.indexes ?? [])]
  }

  protected get maxIndexSize() {
    return this.config.maxIndexSize ?? DEFAULT_MAX_INDEX_SIZE
  }

  protected all(order: Order = 'desc', cursor?: Hex) {
    return order === 'asc' ? this.allAsc(cursor) : this.allDesc(cursor)
  }

  protected allAsc(cursor?: Hex) {
    const payloads = this.payloadsWithMeta.sort((a, b) => a._sequence > b._sequence ? 1 : -1)
    const startIndex = (cursor ? (payloads.findIndex(payload => payload._sequence === cursor) ?? -1) : -1) + 1
    return payloads.slice(startIndex)
  }

  protected allDesc(cursor?: Hex) {
    const payloads = this.payloadsWithMeta.sort((a, b) => a._sequence > b._sequence ? -1 : 1)
    const startIndex = (cursor ? (payloads.findIndex(payloads => payloads._sequence === cursor) ?? -1) : -1) + 1
    return payloads.slice(startIndex)
  }

  protected override async archivistInstance(): Promise<ArchivistInstance | undefined>
  protected override async archivistInstance(required: true): Promise<ArchivistInstance>
  protected override async archivistInstance(required = false): Promise<ArchivistInstance | undefined> {
    if (!this._archivistInstance) {
      const archivist = await super.archivistInstance()
      if (required && !archivist) {
        throw new Error('Failed to find archivist')
      }
      archivist?.on('inserted', this.onArchivistInserted)
      archivist?.on('cleared', this.onArchivistCleared)
      archivist?.on('deleted', this.onArchivistDeleted)
      this._archivistInstance = archivist
    }
    return this._archivistInstance
  }

  protected async clearIndex() {
    await this._updatePayloadPairsMutex.runExclusive(() => {
      this._cursor = undefined
      this.payloadsWithMeta = []
      this.indexMaps = {}
    })
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const filters = payloads?.filter(isPayloadDivinerQueryPayload) ?? []
    assertEx(filters.length < 2, () => 'Multiple PayloadDivinerQuery payloads may not be specified')
    const filter = assertEx(filters.shift(), () => 'No PayloadDivinerQuery specified') as unknown as
      PayloadDivinerQueryPayload<EmptyObject, Hash>

    await this.updateIndex()

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      schema, schemas, order, limit, cursor, ...props
    } = filter
    let all: TOut[] = this.all(order, cursor)
    if (all) {
      if (schemas?.length) all = all.filter(payload => schemas.includes(payload.schema))
      if (Object.keys(props).length > 0) {
        const additionalFilterCriteria = Object.entries(props)
        for (const [prop, filter] of additionalFilterCriteria) {
          const property = prop as keyof TOut
          all
            = Array.isArray(filter)
              ? all.filter(payload =>
                  filter.every((value) => {
                    const prop = payload?.[property]
                    // TODO: This seems to be written just to check arrays, and now that $meta is there, need to check type?
                    return Array.isArray(prop) && prop.includes?.(value)
                  }))
              : all.filter(payload => payload?.[property] === filter)
        }
      }
      return limit ? all.slice(0, limit) : all
    } else {
      throw new Error('Archivist does not support "all"')
    }
  }

  protected onArchivistCleared: EventListener<ArchivistModuleEventData['cleared']> = () => {
    forget(
      (async () => {
        await this.clearIndex()
        await this.updateIndex()
      })(),
    )
  }

  // we are just rebuilding the entire index at this point on delete since large archivists do not support delete
  protected onArchivistDeleted: EventListener<ArchivistModuleEventData['deleted']> = () => {
    forget(
      (async () => {
        await this.clearIndex()
        await this.updateIndex()
      })(),
    )
  }

  protected onArchivistInserted: EventListener<ArchivistModuleEventData['inserted']> = () => {
    forget(this.updateIndex())
  }

  protected override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    const archivist = await this.archivistInstance(true)
    archivist.off('inserted', this.onArchivistInserted)
    archivist.off('deleted', this.onArchivistDeleted)
    archivist.off('cleared', this.onArchivistCleared)
    return await super.stopHandler()
  }

  // index any new payloads
  protected async updateIndex() {
    await this._updatePayloadPairsMutex.runExclusive(async () => {
      const archivist = await this.archivistInstance(true)
      let newPayloads = await PayloadBuilder.addStorageMeta((await archivist.next({ limit: 100, cursor: this._cursor })) as WithStorageMeta<TOut>[])
      while (newPayloads.length > 0) {
        const prevCursor = this._cursor
        this._cursor = newPayloads.at(-1)?._sequence
        if (this._cursor === prevCursor) {
          this.logger.warn('next cursor not found', this._cursor, prevCursor)
        }
        assertEx(this.payloadsWithMeta.length + newPayloads.length <= this.maxIndexSize, () => 'maxIndexSize exceeded')
        await this.indexPayloads(newPayloads)
        newPayloads = await PayloadBuilder.addStorageMeta((await archivist.next({ limit: 100, cursor: this._cursor })) as WithStorageMeta<TOut>[])
      }
    })
  }

  private async indexPayloads(payloads: TOut[]): Promise<Hash> {
    const payloadsWithMeta = (await PayloadBuilder.addStorageMeta(payloads))
      .map((payload, index) => ({ ...payload, _sequence: `${Date.now()}${toHex(index, { byteSize: StorageMetaConstants.nonceBytes })}` as Hex }))
    this.payloadsWithMeta.push(...payloadsWithMeta)

    // update the custom indexes
    for (const index of this.indexes ?? []) {
      this.indexMaps[index] = this.indexMaps[index] ?? []
      for (const payload of payloadsWithMeta) {
        this.indexMaps[index].push(payload)
      }
    }
    return assertEx(payloadsWithMeta.at(-1), () => 'No payloads to index')._hash
  }
}
