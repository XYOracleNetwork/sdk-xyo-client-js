import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { AbstractModule, Module, ModuleFilter, ModuleWrapper } from '@xyo-network/module'
import { isXyoPayloadOfSchemaType, PayloadWrapper, XyoPayload } from '@xyo-network/payload'
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

  private _archivist?: ArchivistWrapper

  public get archivist() {
    this._archivist = this._archivist ?? new ArchivistWrapper(this.module)
    return this._archivist
  }

  async attach(address: string, name?: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachQuery>({ address, name, schema: XyoNodeAttachQuerySchema })
    await this.sendQuery(queryPayload)
  }

  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachedQuery>({ schema: XyoNodeAttachedQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isXyoPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async attachedModules(): Promise<AbstractModule[]> {
    const addresses = await this.attached()
    return compact(await this.resolve({ address: addresses }))
  }

  async detach(address: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeDetachQuery>({ address, schema: XyoNodeDetachQuerySchema })
    await this.sendQuery(queryPayload)
  }

  find(_filter: ModuleFilter): Promisable<AbstractModule[]> {
    throw Error('Not implemented')
  }

  register(_module: Module): void {
    throw Error('Not implemented')
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeRegisteredQuery>({ schema: XyoNodeRegisteredQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isXyoPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async registeredModules(): Promise<AbstractModule[]> {
    const addresses = await this.registered()
    return compact(await this.resolve({ address: addresses }))
  }

  resolve(_filter: ModuleFilter): Promisable<AbstractModule[]> {
    throw Error('Not implemented')
  }

  tryResolve(_filter: ModuleFilter): Promisable<AbstractModule[]> {
    throw Error('Not implemented')
  }

  unregister(_module: Module): void {
    throw Error('Not implemented')
  }
}

/** @deprecated use NodeWrapper instead */
export class XyoNodeWrapper extends NodeWrapper {}
