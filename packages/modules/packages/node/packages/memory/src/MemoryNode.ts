import { assertEx } from '@xylabs/assert'
import type { EventListener } from '@xylabs/events'
import { exists } from '@xylabs/exists'
import type { Address } from '@xylabs/hex'
import { isAddress } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import { isDefined } from '@xylabs/typeof'
import {
  type AnyConfigSchema,
  type AttachableModuleInstance,
  creatableModule,
  type Module,
  type ModuleIdentifier,
  type ModuleInstance,
  type ModuleResolverInstance,
} from '@xyo-network/module-model'
import type { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { AbstractNode } from '@xyo-network/node-abstract'
import type {
  ChildCertificationFields,
  NodeConfig, NodeModuleEventData, NodeParams,
} from '@xyo-network/node-model'
import { isNodeModule } from '@xyo-network/node-model'
import { Mutex } from 'async-mutex'

export type MemoryNodeParams = NodeParams<AnyConfigSchema<NodeConfig>>

@creatableModule()
export class MemoryNode<TParams extends MemoryNodeParams = MemoryNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractNode<TParams, TEventData> {
  protected registeredModuleMap: Partial<Record<Address, AttachableModuleInstance>> = {}

  private _attachMutex = new Mutex()

  private _attachedPrivateModules = new Set<Address>()
  private _attachedPublicModules = new Set<Address>()

  async attachHandler(id: ModuleIdentifier, external?: boolean) {
    this.started('throw')
    return assertEx(
      isAddress(id) ? await this.attachUsingAddress(id as Address, external) : await this.attachUsingName(id, external),
      () => `Unable to locate module [${id}]`,
    )
  }

  async certifyHandler(id: ModuleIdentifier): Promise<ChildCertificationFields> {
    const child = (await this.publicChildren()).find(child => child.modName === id || child.address === id)
    if (child) {
      return { address: child.address, expiration: Date.now() + 1000 * 60 * 10 /* 10 minutes */ }
    }
    throw new Error(`Unable to certify child module [${id}]`)
  }

  async detachHandler(id: ModuleIdentifier) {
    this.started('throw')
    return isAddress(id) ? await this.detachUsingAddress(id as Address) : await this.detachUsingName(id)
  }

  override async privateChildren(): Promise<ModuleInstance[]> {
    return [...(await this.attachedPrivateModules()), ...this.params.privateChildren ?? []]
  }

  override async publicChildren(): Promise<ModuleInstance[]> {
    return [...(await this.attachedPublicModules()), ...this.params.publicChildren ?? []]
  }

  async register(mod: AttachableModuleInstance) {
    this.started('throw')
    if (this.registeredModuleMap[mod.address]) {
      if (this.registeredModuleMap[mod.address] === mod) {
        this.logger?.warn(`Module already registered at that address[${mod.address}]|${mod.id}|[${mod.config.schema}]`)
      } else {
        throw new Error(`Other module already registered at that address[${mod.address}]|${mod.id}|[${mod.config.schema}]`)
      }
    }
    this.registeredModuleMap[mod.address] = mod
    const args = { mod, name: mod.modName }
    await this.emit('moduleRegistered', args)
  }

  registeredHandler(): Promisable<Address[]> {
    return Promise.resolve(
      (Object.keys(this.registeredModuleMap) as Address[]).map((key) => {
        return key
      }),
    )
  }

  registeredModules(): AttachableModuleInstance[] {
    return Object.values(this.registeredModuleMap).map((value) => {
      return value
    }).filter(exists)
  }

  async unregister(mod: ModuleInstance): Promise<ModuleInstance> {
    this.started('throw')
    // try to detach if it is attached
    try {
      await this.detach(mod.address)
    } catch {}
    delete this.registeredModuleMap[mod.address]
    const args = { mod, name: mod.modName }
    await this.emit('moduleUnregistered', args)
    return this
  }

  protected async attachUsingAddress(address: Address, external?: boolean) {
    return await this._attachMutex.runExclusive(async () => {
      const existingModule = await this.resolve(address)
      if (existingModule) {
        this.logger?.warn(`MemoryNode: Module [${existingModule?.modName ?? existingModule?.address}] already attached at address [${address}]`)
      }
      const mod = assertEx(this.registeredModuleMap[address], () => `No Module Registered at address [${address}]`)

      if (this._attachedPublicModules.has(mod.address)) {
        this.logger?.warn(`Module [${mod.modName}] already attached at [${address}] (public)`)
      }
      if (this._attachedPrivateModules.has(mod.address)) {
        this.logger?.warn(`Module [${mod.modName}] already attached at [${address}] (private)`)
      }

      const notificationList = await this.getModulesToNotifyAbout(mod)

      // give it private access
      mod.upResolver.addResolver?.(this.privateResolver)

      // give it public access
      mod.upResolver.addResolver?.(this.downResolver as CompositeModuleResolver)

      // give it outside access
      mod.upResolver.addResolver?.(this.upResolver)

      if (external) {
        // expose it externally
        this._attachedPublicModules.add(mod.address)
        this.downResolver.addResolver(mod.downResolver as ModuleResolverInstance)
      } else {
        this._attachedPrivateModules.add(mod.address)
        this.privateResolver.addResolver(mod.downResolver as ModuleResolverInstance)
      }

      mod.addParent(this)

      const args = { mod, name: mod.modName }
      await this.emit('moduleAttached', args)

      if (isNodeModule(mod) && external) {
        const attachedListener: EventListener<TEventData['moduleAttached']> = async (args: TEventData['moduleAttached']) =>
          await this.emit('moduleAttached', args)

        const detachedListener: EventListener<TEventData['moduleDetached']> = async (args: TEventData['moduleDetached']) =>
          await this.emit('moduleDetached', args)

        mod.on('moduleAttached', attachedListener as EventListener)
        mod.on('moduleDetached', detachedListener as EventListener)
      }

      await this.notifyOfExistingModulesAttached(notificationList)

      return address
    })
  }

  protected async detachUsingAddress(address: Address) {
    const mod = assertEx(this.registeredModuleMap[address], () => `No Module Registered at address [${address}]`)

    const isAttachedPublic = this._attachedPublicModules.has(mod.address)
    const isAttachedPrivate = this._attachedPrivateModules.has(mod.address)

    assertEx(isAttachedPublic || isAttachedPrivate, () => `Module [${mod.modName}] not attached at [${address}]`)

    // remove inside access
    mod.upResolver?.removeResolver?.(this.privateResolver)

    // remove outside access
    mod.upResolver?.removeResolver?.(this.upResolver)

    // remove external exposure
    this.downResolver.removeResolver(mod.downResolver as ModuleResolverInstance)

    mod.removeParent(this.address)

    if (isAttachedPublic) {
      this._attachedPublicModules.delete(mod.address)
    }

    if (isAttachedPrivate) {
      this._attachedPrivateModules.delete(mod.address)
    }

    const args = { mod, name: mod.modName }
    await this.emit('moduleDetached', args)

    // notify of all sub node children detach
    if (isNodeModule(mod)) {
      const notificationList = await this.getModulesToNotifyAbout(mod)
      await this.notifyOfExistingModulesDetached(notificationList)
    }
    return address
  }

  protected override startHandler() {
    return super.startHandler()
  }

  private async attachUsingName(name: string, external?: boolean) {
    const address = this.registeredModuleAddressFromName(name)
    if (isDefined(address)) {
      return await this.attachUsingAddress(address, external)
    }
  }

  private async detachUsingName(name: string) {
    const address = this.registeredModuleAddressFromName(name)
    if (isDefined(address)) {
      return await this.detachUsingAddress(address)
    }
  }

  private async getModulesToNotifyAbout(node: ModuleInstance) {
    const notifiedAddresses: string[] = []
    // send attach events for all existing attached modules
    const childModules = await node.resolve('*', { direction: 'down' })
    return (
      childModules.map((child) => {
        // don't report self
        if (node.address === child.address) {
          return
        }

        // prevent loop
        if (notifiedAddresses.includes(child.address)) {
          return
        }

        notifiedAddresses.push(child.address)

        return child
      })
    ).filter(exists)
  }

  private async notifyOfExistingModulesAttached(childModules: Module[]) {
    await Promise.all(
      childModules.map(async (child) => {
        const args = { mod: child, name: child.modName }
        await this.emit('moduleAttached', args)
      }),
    )
  }

  private async notifyOfExistingModulesDetached(childModules: Module[]) {
    await Promise.all(
      childModules.map(async (child) => {
        const args = { mod: child, name: child.modName }
        await this.emit('moduleDetached', args)
      }),
    )
  }

  private registeredModuleAddressFromName(name: string) {
    return Object.values(this.registeredModuleMap).find((value) => {
      return value?.modName === name
    })?.address
  }
}
