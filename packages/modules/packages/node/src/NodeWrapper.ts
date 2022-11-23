import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { Module, ModuleFilter, ModuleWrapper, XyoModule } from '@xyo-network/module'
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

export class NodeWrapper extends ModuleWrapper implements NodeModule {
  public isModuleResolver = true

  private _archivist?: XyoArchivistWrapper

  public get archivist() {
    this._archivist = this._archivist ?? new XyoArchivistWrapper(this.module)
    return this._archivist
  }

  async attach(address: string, name?: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachQuery>({ address, name, schema: XyoNodeAttachQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
  }

  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachedQuery>({ schema: XyoNodeAttachedQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return compact(result[1].map((payload) => payload?.schema))
  }

  async attachedModules(): Promise<XyoModule[]> {
    const addresses = await this.attached()
    return compact(await this.resolve({ address: addresses }))
  }

  async detach(address: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeDetachQuery>({ address, schema: XyoNodeDetachQuerySchema })
    await this.sendQuery(queryPayload)
  }

  find(_filter: ModuleFilter): Promisable<XyoModule[]> {
    throw Error('Not implemented')
  }

  register(_module: Module): void {
    throw Error('Not implemented')
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeRegisteredQuery>({ schema: XyoNodeRegisteredQuerySchema })
    const result = await this.sendQuery(queryPayload)
    return compact(result[1].map((payload) => payload?.schema))
  }

  async registeredModules(): Promise<XyoModule[]> {
    const addresses = await this.registered()
    return compact(await this.resolve({ address: addresses }))
  }

  resolve(_filter: ModuleFilter): Promisable<XyoModule[]> {
    throw Error('Not implemented')
  }

  tryResolve(_filter: ModuleFilter): Promisable<XyoModule[]> {
    throw Error('Not implemented')
  }

  unregister(_module: Module): void {
    throw Error('Not implemented')
  }
}

/** @deprecated use NodeWrapper instead */
export class XyoNodeWrapper extends NodeWrapper {}
