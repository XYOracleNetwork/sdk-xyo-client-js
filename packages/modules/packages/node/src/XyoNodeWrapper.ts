import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { Module, XyoModule, XyoModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'

import { NodeModule } from './NodeModule'
import {
  XyoNodeAttachedQuery,
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuery,
  XyoNodeAttachQuerySchema,
  XyoNodeDetachQuery,
  XyoNodeDetachQuerySchema,
  XyoNodeRegisteredQuery,
  XyoNodeRegisteredQuerySchema,
} from './Queries'

export class XyoNodeWrapper extends XyoModuleWrapper implements NodeModule {
  private _archivist?: XyoArchivistWrapper
  public get archivist() {
    this._archivist = this._archivist ?? new XyoArchivistWrapper({ module: this.module })
    return this._archivist
  }

  register(_module: Module): void {
    throw Error('Not implemented')
  }
  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeRegisteredQuery>({ schema: XyoNodeRegisteredQuerySchema })
    const query = await this.bindQuery(queryPayload)
    return compact((await this.module.query(query[0], query[1]))[1].map((payload) => payload?.schema))
  }
  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachedQuery>({ schema: XyoNodeAttachedQuerySchema })
    const query = await this.bindQuery(queryPayload)
    return compact((await this.module.query(query[0], query[1]))[1].map((payload) => payload?.schema))
  }
  async attach(address: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachQuery>({ address, schema: XyoNodeAttachQuerySchema })
    const query = await this.bindQuery(queryPayload)
    compact(await this.module.query(query[0], query[1]))
    return
  }
  async detach(address: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeDetachQuery>({ address, schema: XyoNodeDetachQuerySchema })
    const query = await this.bindQuery(queryPayload)
    compact(await this.module.query(query[0], query[1]))
    return
  }

  async registeredModules(): Promise<XyoModule[]> {
    const addresses = await this.registered()
    return compact(await this.resolve(addresses))
  }
  async attachedModules(): Promise<XyoModule[]> {
    const addresses = await this.attached()
    return compact(await this.resolve(addresses))
  }

  resolve(_address: string[]): Promisable<(XyoModule | null)[]> {
    throw Error('Not implemented')
  }
}
