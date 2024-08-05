import { Server } from 'node:http'

import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import {
  asyncHandler,
  customPoweredByHeader,
  disableCaseSensitiveRouting,
  disableExpressDefaultPoweredByHeader,
  jsonBodyParser,
  responseProfiler,
  useRequestCounters,
} from '@xylabs/sdk-api-express-ecs'
import { isQueryBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeExposeOptions, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
// import { standardResponses } from '@xyo-network/express-node-middleware'
import { AnyConfigSchema, creatableModule, ModuleInstance, ModuleQueryResult, resolveAddressToInstanceUp } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import express, { Application, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { HttpBridgeBase } from './HttpBridgeBase.ts'
import { HttpBridgeConfig } from './HttpBridgeConfig.ts'

/**
 * The type of the path parameters for the address path.
 */
type AddressPathParams = {
  address: Address
}

/**
 * The type of the request body for the address path.
 */
type PostAddressRequestBody = [QueryBoundWitness, undefined | Payload[]]

// TODO: This does not match the error response shape of the legacy bridge BUT it its the
// shape this bridge is currently returning.  Massage this into the standard
// error shape constructed via middleware.
/* type ErrorResponseBody = {
  error: string
} */

export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {}

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends HttpBridgeBase<TParams> {
  protected _app?: Application
  protected _exposedModules: WeakRef<ModuleInstance>[] = []
  protected _server?: Server

  protected get app() {
    if (!this._app) this._app = this.initializeApp()
    return assertEx(this._app, () => 'App not initialized')
  }

  async exposeChild(mod: ModuleInstance, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 5 } = options ?? {}
    assertEx(this.config.host, () => 'Not configured as a host')
    this._exposedModules.push(new WeakRef(mod))
    const children = maxDepth > 0 ? ((await mod.publicChildren?.()) ?? []) : []
    this.logger.log(`childrenToExpose [${mod.id}][${mod.address}]: ${toJsonString(children.map(child => child.id))}`)
    const exposedChildren = (await Promise.all(children.map(child => this.exposeChild(child, { maxDepth: maxDepth - 1, required: false }))))
      .flat()
      .filter(exists)
    const allExposed = [mod, ...exposedChildren]

    for (const exposedMod of allExposed) this.logger?.log(`exposed: ${exposedMod.address} [${mod.id}]`)

    return allExposed
  }

  override async exposeHandler(address: Address, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { required = true } = options ?? {}
    const mod = await resolveAddressToInstanceUp(this, address)
    if (required && !mod) {
      throw new Error(`Unable to find required module: ${address}`)
    }
    if (mod) {
      return this.exposeChild(mod, options)
    }
    return []
  }

  override exposedHandler(): Address[] {
    return this._exposedModules.map(ref => ref.deref()?.address).filter(exists)
  }

  override async startHandler(): Promise<boolean> {
    return (await super.startHandler()) && (await this.startHttpServer())
  }

  override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    return (await super.stopHandler()) && (await this.stopHttpServer())
  }

  override async unexposeHandler(address: Address, options?: BridgeUnexposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 2, required = true } = options ?? {}
    assertEx(this.config.host, () => 'Not configured as a host')
    const mod = this._exposedModules.find(ref => ref.deref()?.address === address)?.deref()
    assertEx(!required || mod, () => `Module not exposed: ${address}`)
    this._exposedModules = this._exposedModules.filter(ref => ref.deref()?.address !== address)
    if (mod) {
      const children = maxDepth > 0 ? ((await mod.publicChildren?.()) ?? []) : []
      const exposedChildren = (
        await Promise.all(children.map(child => this.unexposeHandler(child.address, { maxDepth: maxDepth - 1, required: false })))
      )
        .flat()
        .filter(exists)
      return [mod, ...exposedChildren]
    }
    return []
  }

  protected async callLocalModule(address: Address, query: QueryBoundWitness, payloads: Payload[]): Promise<ModuleQueryResult | null> {
    const mod = this._exposedModules.find(ref => ref.deref()?.address === address)?.deref()
    return mod ? await mod.query(query, payloads) : null
  }

  protected async handleGet(req: Request<AddressPathParams, ModuleQueryResult, PostAddressRequestBody>, res: Response) {
    const { address } = req.params
    try {
      if (address == this.address) {
        res.json(await this.stateQuery(this.account))
      } else {
        const mod = this._exposedModules.find(ref => ref.deref()?.address === address)?.deref()
        // TODO: Use standard errors middleware
        if (mod) {
          res.json(await mod.stateQuery(this.account))
        } else {
          res.status(StatusCodes.NOT_FOUND).json({ error: 'Module not found' })
        }
      }
    } catch (ex) {
      // TODO: Sanitize message
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (ex as Error).message })
    }
  }

  protected async handlePost(req: Request<AddressPathParams, ModuleQueryResult, PostAddressRequestBody>, res: Response) {
    const { address } = req.params
    const [bw, payloads = []] = Array.isArray(req.body) ? req.body : []
    const query = isQueryBoundWitness(bw) ? bw : undefined
    if (!query) {
      // TODO: Use standard errors middleware
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'No query provided' })
      return
    }
    try {
      if (address == this.address) {
        const result = await this.query(query, payloads)
        return res.json(result)
      } else {
        const result = await this.callLocalModule(address, query, payloads)
        // TODO: Use standard errors middleware
        if (result === null) {
          res.status(StatusCodes.NOT_FOUND).json({ error: 'Module not found' })
        } else {
          res.json(result)
        }
      }
    } catch (ex) {
      // TODO: Sanitize message
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (ex as Error).message })
    }
  }

  protected initializeApp() {
    // Create the express app
    const app = express()

    // Add middleware
    app.use(responseProfiler)
    app.use(jsonBodyParser)
    // removed for now since this causes a cycle
    // app.use(standardResponses)
    disableExpressDefaultPoweredByHeader(app)
    app.use(customPoweredByHeader)
    disableCaseSensitiveRouting(app)
    useRequestCounters(app)

    // Add routes
    // Redirect all requests to the root to this module's address
    app.get('/', (_req, res) => res.redirect(StatusCodes.MOVED_TEMPORARILY, `/${this.address}`))
    app.post('/', (_req, res) => res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/${this.address}`))

    app.get<AddressPathParams, ModuleQueryResult>(
      '/:address',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      asyncHandler(async (req, res) => await this.handleGet(req, res)),
    )
    app.post<AddressPathParams, ModuleQueryResult, PostAddressRequestBody>(
      '/:address',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      asyncHandler(async (req, res) => await this.handlePost(req, res)),
    )
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
