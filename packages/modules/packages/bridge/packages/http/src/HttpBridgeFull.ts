import { Server } from 'node:http'

import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { ApiEnvelopeSuccess } from '@xyo-network/api-models'
import { isQueryBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeExposeOptions, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { AnyConfigSchema, creatableModule, ModuleInstance, ModuleQueryResult, resolveAddressToInstanceUp } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import express, { Application, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { HttpBridgeBase } from './HttpBridgeBase'
import { HttpBridgeConfig } from './HttpBridgeConfig'

export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {}

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends HttpBridgeBase<TParams> {
  protected _app?: Application
  protected _exposedModules: WeakRef<ModuleInstance>[] = []
  protected _server?: Server

  protected get app() {
    if (!this._app) this._app ?? this.initializeApp()
    return assertEx(this._app, () => 'App not initialized')
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
    const startHandlerResult = await super.startHandler()
    const startHttpServerResult = await this.startHttpServer()
    return startHandlerResult && startHttpServerResult
  }

  override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    const stopHandlerResult = await super.stopHandler()
    const stopHttpServerResult = await this.stopHttpServer()
    return stopHandlerResult && stopHttpServerResult
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

  protected async callLocalModule(address: Address, query: QueryBoundWitness, payloads: Payload[]): Promise<ModuleQueryResult | null> {
    const mod = this._exposedModules.find((ref) => ref.deref()?.address === address)?.deref()
    return mod ? await mod.query(query, payloads) : null
  }

  protected handlePost(req: Request<Payload[]>, res: Response) {
    const allPayloads = req.body as Payload[]
    const query = allPayloads.find(isQueryBoundWitness) as QueryBoundWitness
    const payloads = allPayloads.filter((payload) => !isQueryBoundWitness(payload))
    this.callLocalModule(req.route, query, payloads)
      .then((result) => {
        if (result === null) {
          res.status(404).json({ error: 'Module not found' })
        } else {
          const envelope = {
            data: result,
          } as ApiEnvelopeSuccess<ModuleQueryResult>
          res.json(envelope)
        }
      })
      .catch((ex) => {
        res.status(500).json({ error: (ex as Error).message })
      })
  }

  protected initializeApp() {
    const app = express()
    app.use(express.json())

    // Redirect all requests to the root to this module's address
    app.get('/', (_req, res) => res.redirect(StatusCodes.MOVED_TEMPORARILY, `/${this.address}`))
    app.post('/', (_req, res) => res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/${this.address}`))

    // TODO: Handle GET requests
    // TODO: Use async helper wrapper and await the result
    app.post<Payload[]>('/', (req, res) => this.handlePost(req, res))
    return app
  }

  protected startHttpServer(): Promise<boolean> {
    if (this.config.host) {
      assertEx(!this._server, () => 'Server already started')
      this._server = this.app.listen(this.config.host?.port ?? 3030)
    }
    return Promise.resolve(true)
  }

  protected stopHttpServer(): Promise<boolean> {
    if (this.config.host) {
      return new Promise((resolve, reject) => {
        if (this._server) {
          this._server.close((err) => {
            if (err) {
              reject(err)
            } else {
              this._server = undefined
              resolve(true)
            }
          })
        }
      })
    }
    return Promise.resolve(true)
  }
}
