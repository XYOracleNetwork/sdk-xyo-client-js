import { Server } from 'node:http'

import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { BridgeExposeOptions, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { AnyConfigSchema, creatableModule, ModuleInstance, resolveAddressToInstanceUp } from '@xyo-network/module-model'
import express, { Application } from 'express'

import { HttpBridgeBase } from './HttpBridgeBase'
import { HttpBridgeConfig } from './HttpBridgeConfig'

export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {}

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends HttpBridgeBase<TParams> {
  protected _app?: Application
  protected _exposedModules: WeakRef<ModuleInstance>[] = []
  protected _server?: Server

  get app() {
    this._app =
      this._app ??
      (() => {
        const app = express()
        app.use(express.json())
        return app
      })()
    return this._app
  }

  async exposeChild(mod: ModuleInstance, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 5 } = options ?? {}
    console.log(`exposeChild: ${mod.address} ${mod?.id} ${maxDepth}`)
    assertEx(this.config.host, () => 'Not configured as a host')
    this._exposedModules.push(new WeakRef(mod))
    const children = maxDepth > 0 ? (await mod.publicChildren?.()) ?? [] : []
    this.logger.log(`childrenToExpose [${mod.id}][${mod.address}]: ${toJsonString(children.map((child) => child.id))}`)
    const exposedChildren = (await Promise.all(children.map((child) => this.exposeChild(child, { maxDepth: maxDepth - 1, required: false }))))
      .flat()
      .filter(exists)
    const allExposed = [mod, ...exposedChildren]

    for (const exposedMod of allExposed) this.logger?.log(`exposed: ${exposedMod.address} [${mod.id}]`)

    return allExposed
  }

  override async exposeHandler(address: Address, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { required = true } = options ?? {}
    const mod = await resolveAddressToInstanceUp(this, address)
    console.log(`exposeHandler: ${address} ${mod?.id}`)
    if (required && !mod) {
      throw new Error(`Unable to find required module: ${address}`)
    }
    if (mod) {
      return this.exposeChild(mod, options)
    }
    return []
  }

  override exposedHandler(): Address[] {
    return this._exposedModules.map((ref) => ref.deref()?.address).filter(exists)
  }

  override async startHandler(): Promise<boolean> {
    return (await super.startHandler()) && this.startHttpServer()
  }

  override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    return (await super.stopHandler()) && this.stopHttpServer()
  }

  override async unexposeHandler(address: Address, options?: BridgeUnexposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 2, required = true } = options ?? {}
    assertEx(this.config.host, () => 'Not configured as a host')
    const mod = this._exposedModules.find((ref) => ref.deref()?.address === address)?.deref()
    assertEx(!required || mod, () => `Module not exposed: ${address}`)
    this._exposedModules = this._exposedModules.filter((ref) => ref.deref()?.address !== address)
    if (mod) {
      const children = maxDepth > 0 ? (await mod.publicChildren?.()) ?? [] : []
      const exposedChildren = (
        await Promise.all(children.map((child) => this.unexposeHandler(child.address, { maxDepth: maxDepth - 1, required: false })))
      )
        .flat()
        .filter(exists)
      return [mod, ...exposedChildren]
    }
    return []
  }

  protected startHttpServer() {
    if (this.config.host) {
      assertEx(!this._server, () => 'Server already started')
      this.app.get('/', (_req, res) => {
        //TODO: Handle The request
        res.json({ schema: 'network.xyo.test' })
      })
      this._server = this.app.listen(this.config.host?.port ?? 3030)
    }
    return true
  }

  protected stopHttpServer() {
    const server = assertEx(this._server, () => 'Server not started')
    server.close()
    this._server = undefined
    return true
  }
}
