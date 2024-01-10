import { assertEx } from '@xylabs/assert'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'
import { IDBPDatabase } from 'idb'

import { IndexedDbPayloadDivinerConfigSchema } from './Config'
import { IndexedDbPayloadDivinerParams } from './Params'

export interface PayloadStore {
  [s: string]: Payload
}

export class IndexedDbPayloadDiviner<
  TParams extends IndexedDbPayloadDivinerParams = IndexedDbPayloadDivinerParams,
  TIn extends PayloadDivinerQueryPayload = PayloadDivinerQueryPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [IndexedDbPayloadDivinerConfigSchema]
  static defaultDbName = 'archivist'
  static defaultDbVersion = 1
  static defaultStoreName = 'payloads'

  private _db: IDBPDatabase<PayloadStore> | undefined

  /**
   * The database name. If not supplied via config it defaults to
   * `archivist`. This behavior biases towards a single, isolated
   * DB per archivist which seems to make the most sense for 99% of
   * use cases.
   */
  get dbName() {
    return this.config?.dbName ?? IndexedDbPayloadDiviner.defaultDbName
  }

  /**
   * The database version. If not supplied via config, it defaults to 1.
   */
  get dbVersion() {
    return this.config?.dbVersion ?? IndexedDbPayloadDiviner.defaultDbVersion
  }

  /**
   * The database indexes.
   */
  get indexes() {
    return this.config?.storage?.indexes ?? []
  }

  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`.
   */
  get storeName() {
    return this.config?.storeName ?? IndexedDbPayloadDiviner.defaultStoreName
  }

  private get db(): IDBPDatabase<PayloadStore> {
    return assertEx(this._db, 'DB not initialized')
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const filter = assertEx(payloads?.filter(isPayloadDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.getArchivist(), 'Unable to resolve archivist')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schemas, limit, offset, hash, order, schema, ...props } = filter

    return []
  }
}
