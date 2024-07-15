import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import { EventListener } from '@xyo-network/module-events'
import {
  AnyConfigSchema,
  AttachableModuleInstance,
  Module,
  ModuleIdentifier,
  ModuleInstance,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { AbstractNode } from '@xyo-network/node-abstract'
import { AttachableNodeInstance, ChildCertificationFields, isNodeModule, NodeConfig, NodeModuleEventData, NodeParams } from '@xyo-network/node-model'
import { Mutex } from 'async-mutex'

export type MemoryNodeParams = NodeParams<AnyConfigSchema<NodeConfig>>

export class MemoryNode<TParams extends MemoryNodeParams = MemoryNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractNode<TParams, TEventData>
  implements AttachableNodeInstance<TParams, TEventData>
{
  protected registeredModuleMap: Record<Address, AttachableModuleInstance> = {}

  private _attachMutex = new Mutex()

  private _attachedPrivateModules = new Set<Address>()
  private _attachedPublicModules = new Set<Address>()

  async attachHandler(id: ModuleIdentifier, external?: boolean) {
    await this.started('throw')
    const attachedModule = assertEx(
      isAddress(id) ? await this.attachUsingAddress(id as Address, external) : await this.attachUsingName(id, external),
      () => `Unable to locate module [${id}]`,
    )
    return attachedModule
  }

  async certifyHandler(id: ModuleIdentifier): Promise<ChildCertificationFields> {
    const child = (await this.publicChildren()).find((child) => child.modName === id || child.address === id)
    if (child) {
      return { address: child.address, expiration: Date.now() + 1000 * 60 * 10 /* 10 minutes */ }
    }
    throw new Error(`Unable to certify child module [${id}]`)
  }

  async detachHandler(id: ModuleIdentifier) {
    await this.started('throw')
    return isAddress(id) ? await this.detachUsingAddress(id as Address) : await this.detachUsingName(id)
  }

  override privateChildren(): Promise<ModuleInstance[]> {
    return this.attachedPrivateModules()
  }

  override publicChildren(): Promise<ModuleInstance[]> {
    return this.attachedPublicModules()
  }

  async register(mod: AttachableModuleInstance) {
    await this.started('throw')
    if (this.registeredModuleMap[mod.address]) {
      if (this.registeredModuleMap[mod.address] === mod) {
        this.logger.warn(`Module already registered at that address[${mod.address}]|${mod.id}|[${mod.config.schema}]`)
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
    })
  }

  async unregister(mod: ModuleInstance): Promise<ModuleInstance> {
    await this.started('throw')
    //try to detach if it is attached
    try {
      await this.detach(mod.address)
    } catch {
      null
    }
    delete this.registeredModuleMap[mod.address]
    const args = { mod, name: mod.modName }
    await this.emit('moduleUnregistered', args)
    return this
  }

  protected async attachUsingAddress(address: Address, external?: boolean) {
    return await this._attachMutex.runExclusive(async () => {
      const existingModule = await this.resolve(address)
      assertEx(!existingModule, () => `Module [${existingModule?.modName ?? existingModule?.address}] already attached at address [${address}]`)
      const mod = assertEx(this.registeredModuleMap[address], () => `No Module Registered at address [${address}]`)

      assertEx(!this._attachedPublicModules.has(mod.address), () => `Module [${mod.modName}] already attached at [${address}] (public)`)
      assertEx(!this._attachedPrivateModules.has(mod.address), () => `Module [${mod.modName}] already attached at [${address}] (private)`)

      const notificationList = await this.getModulesToNotifyAbout(mod)

      //give it private access
      mod.upResolver.addResolver?.(this.privateResolver)

      //give it public access
      mod.upResolver.addResolver?.(this.downResolver as CompositeModuleResolver)

      //give it outside access
      mod.upResolver.addResolver?.(this.upResolver)

      if (external) {
        //expose it externally
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

    //remove inside access
    mod.upResolver?.removeResolver?.(this.privateResolver)

    //remove outside access
    mod.upResolver?.removeResolver?.(this.upResolver)

    //remove external exposure
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

    //notify of all sub node children detach
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
    if (address) {
      return await this.attachUsingAddress(address, external)
    }
  }

  private async detachUsingName(name: string) {
    const address = this.registeredModuleAddressFromName(name)
    if (address) {
      return await this.detachUsingAddress(address)
    }
    return
  }

  private async getModulesToNotifyAbout(node: ModuleInstance) {
    const notifiedAddresses: string[] = []
    //send attach events for all existing attached modules
    const childModules = await node.resolve('*', { direction: 'down' })
    return compact(
      childModules.map((child) => {
        //don't report self
        if (node.address === child.address) {
          return
        }

        //prevent loop
        if (notifiedAddresses.includes(child.address)) {
          return
        }

        notifiedAddresses.push(child.address)

        return child
      }),
    )
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
    const address = Object.values(this.registeredModuleMap).find((value) => {
      return value.modName === name
    })?.address
    return address
  }
}
