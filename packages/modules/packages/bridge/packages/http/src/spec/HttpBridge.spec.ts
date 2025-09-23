/* eslint-disable complexity */
/* eslint-disable max-statements */

import '@xylabs/vitest-extended'

import { assertEx } from '@xylabs/assert'
import type { ApiConfig } from '@xyo-network/api-models'
import type { AttachableArchivistInstance } from '@xyo-network/archivist-model'
import {
  asArchivistInstance,
  asAttachableArchivistInstance,
  isArchivistInstance,
  isAttachableArchivistInstance,
} from '@xyo-network/archivist-model'
import type { ModuleDescriptionPayload } from '@xyo-network/module-model'
import {
  isModule, isModuleInstance, isModuleObject,
  ModuleDescriptionSchema,
} from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance, isNodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { MemorySentinel } from '@xyo-network/sentinel-memory'
import { type SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { HDWallet } from '@xyo-network/wallet'
import {
  describe, expect, it,
} from 'vitest'

import { HttpBridge } from '../HttpBridge.ts'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig.ts'

const archivistName = 'XYOPublic:Archivist' // TODO: This should be configurable
const discoverRoots = 'start'
const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getApiConfig = (): ApiConfig => {
  return { apiDomain: process.env.ARCHIVIST_API_DOMAIN || 'https://beta.api.archivist.xyo.network' }
}

export const getArchivist = async (config: ApiConfig = getApiConfig()): Promise<AttachableArchivistInstance> => {
  return assertEx(await tryGetArchivist(config), () => 'Archivist not found')
}

export const tryGetArchivist = async (config: ApiConfig = getApiConfig()): Promise<AttachableArchivistInstance | undefined> => {
  const url = config.root ? `${config.apiDomain}/${config.root}` : config.apiDomain
  const account = await HDWallet.random()
  const bridge = await HttpBridge.create({
    account,
    config: {
      client: { discoverRoots, url }, schema, security,
    },
  })
  await bridge.start()
  const mod = await bridge.resolve(archivistName)
  return isAttachableArchivistInstance(mod) ? mod : undefined
}

/**
 * @group module
 * @group bridge
 */
describe('HttpBridge', () => {
  const baseUrl = `${process.env.API_DOMAIN ?? 'http://localhost:8080'}`

  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  const cases = [
    ['/', `${baseUrl}`],
    /* ['/node', `${baseUrl}/node`], */
  ]

  it.only('HttpBridge: %s', async () => {
    // Bridge to remote node
    const bridge = await HttpBridge.create({
      account: 'random',
      config: {
        discoverRoots: 'start', name: 'TestBridge', nodeUrl: baseUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true },
      },
    })
    await bridge.start()

    // Resolve the archivist from the bridge
    const bridgedModule = await bridge.resolve(archivistName)
    expect(bridgedModule).toBeDefined()

    // Verify that the resolved module is an attachable archivist instance
    expect(isAttachableArchivistInstance(bridgedModule)).toBeTrue()
    const bridgedArchivist = asAttachableArchivistInstance(bridgedModule, 'Failed to cast bridged module to archivist', { required: true })

    // Create a local node
    const node = await MemoryNode.create({ account: 'random' })

    // Register & attach the bridged module with the local node
    await node.register(bridgedArchivist)
    await node.attach(bridgedArchivist.address, true)
    // NOTE: Works if attaching bridge instead
    // await node.register(bridge)
    // await node.attach(bridge.address, true)

    // Resolve the attached archivist from the local node
    const nodeModule = await node.resolve(bridgedArchivist.address)
    expect(nodeModule).toBeDefined()
    // Verify nodeModule identity is still bridgedArchivist via address
    expect(bridgedArchivist.address).toEqual(nodeModule?.address)
    // TODO: Module is no longer an AttachableArchivistInstance after register, attach, and resolve
    // Verify that the resolved archivist is an archivist instance
    expect(isArchivistInstance(nodeModule)).toBeTrue()
    const nodeArchivist = asArchivistInstance(nodeModule, 'Failed to cast node module to archivist', { required: true })

    // Create a sentinel that archives to the attached archivist
    const config: SentinelConfig = {
      archiving: { archivists: [nodeArchivist.address] },
      schema: SentinelConfigSchema,
      synchronous: true,
      tasks: [],
    }
    const account = await HDWallet.random()
    const sentinel = await MemorySentinel.create({ account, config })
    await node.register(sentinel)
    await node.attach(account.address, true)

    // Generate a report from the sentinel
    const report = await sentinel.report()
    expect(report).toBeDefined()
    const hash = await PayloadBuilder.hash(report[0])

    // Verify sentinel can archive the report to bridged archivist
    while (true) {
      const fetched = await nodeArchivist.get([hash])
      if (fetched.length > 0) {
        break
      }
    }
  })
  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create({ account: 'random' })
    const extraMemNode = await MemoryNode.create({ account: 'random' })

    const bridge = await HttpBridge.create({
      account: 'random',
      config: {
        discoverRoots: 'start', name: 'TestBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true },
      },
    })

    await bridge?.start?.()
    await memNode.register(bridge)
    await memNode.attach(bridge?.address, true)

    const resolvedBridge = await memNode.resolve(bridge.id)
    expect(resolvedBridge).toBeDefined()

    const rootModule = await bridge?.resolve('XYOPublic')
    expect(rootModule).toBeDefined()

    const remoteNode = asAttachableNodeInstance(
      rootModule,
      () => `Failed to resolve correct object type [XYOPublic] [${rootModule?.constructor.name}]`,
      { required: true },
    )

    const state = await remoteNode.state()
    const description = state.find(isPayloadOfSchemaType<ModuleDescriptionPayload>(ModuleDescriptionSchema))
    expect(description?.children).toBeArray()
    expect(description?.children?.length).toBeGreaterThan(0)
    expect(description?.queries).toBeArray()
    expect(description?.queries?.length).toBeGreaterThan(0)

    const archivistByName1 = await rootModule?.resolve('Archivist')
    expect(archivistByName1).toBeDefined()
    const archivistByName2 = await bridge.resolve('XYOPublic:Archivist')
    expect(archivistByName2).toBeDefined()
    const publicXyo = await bridge.resolve('XYOPublic')
    expect(publicXyo).toBeDefined()
    const publicXyoSelfResolve = publicXyo?.resolve('XYOPublic')
    expect(publicXyoSelfResolve).toBeDefined()
    if (publicXyo) {
      const bridgedArchivist = await getArchivist()
      expect(bridgedArchivist).toBeDefined()
      if (bridgedArchivist) {
        const attachablePublicXyo = asAttachableArchivistInstance(archivistByName2, 'Failed to cast publicXyo')
        expect(attachablePublicXyo).toBeDefined()
        await extraMemNode.register(bridgedArchivist)
        await extraMemNode.attach(bridgedArchivist.address, true)
        const publicXyoNodeResolveAddress = await extraMemNode?.resolve(bridgedArchivist.address)
        expect(publicXyoNodeResolveAddress).toBeDefined()
        const publicXyoNodeResolve = await extraMemNode?.resolve('Archivist')
        expect(publicXyoNodeResolve).toBeDefined()
      }
    }
    const archivistByName3 = await publicXyo?.resolve('Archivist')
    expect(archivistByName3).toBeDefined()
    expect(archivistByName3).toEqual(archivistByName1)
    expect(archivistByName3).toEqual(archivistByName2)
    expect(archivistByName2).toBeDefined()
    const archivistInstance = asArchivistInstance(archivistByName2, 'Failed to cast archivist', { required: true })
    expect(archivistInstance).toBeDefined()
    const knownPayload = PayloadWrapper.parse({ schema: 'network.xyo.test' })?.payload as Payload
    expect(knownPayload).toBeDefined()
    const knownHash = await PayloadBuilder.dataHash(knownPayload as Payload)
    const insertResult = await archivistInstance.insert([knownPayload])
    expect(insertResult).toBeDefined()
    const roundTripPayload = (await archivistInstance.get([knownHash]))[0]
    expect(roundTripPayload).toBeDefined()
  })
  it.each(cases)('HttpBridge - Nested: %s', async (_, nodeUrl) => {
    const memNode1 = await MemoryNode.create({ account: 'random', config: { schema: 'network.xyo.node.config' } })
    const memNode2 = await MemoryNode.create({ account: 'random', config: { schema: 'network.xyo.node.config' } })
    const memNode3 = await MemoryNode.create({ account: 'random', config: { schema: 'network.xyo.node.config' } })

    await memNode1.register(memNode2)
    await memNode1.attach(memNode2.address, true)
    await memNode2.register(memNode3)
    await memNode2.attach(memNode3.address, true)

    const bridge = await HttpBridge.create({
      account: 'random',
      config: {
        nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true },
      },
    })

    await bridge.getRoots()
    const mod = await bridge.resolve('XYOPublic')

    expect(mod).toBeDefined()
    expect(isModule(mod)).toBeTrue()
    expect(isModuleObject(mod)).toBeTrue()

    const remoteNode = asAttachableNodeInstance(
      mod,
      `Failed to resolve [XYOPublic] - ${mod?.address} [${mod?.id}] [${mod?.constructor.name}]`,
      { required: true },
    )

    expect(isNodeInstance(remoteNode)).toBeTrue()
    expect(isModuleInstance(remoteNode)).toBeTrue()

    await memNode3.register(remoteNode)
    await memNode3.attach(remoteNode?.address, true)
    const description = (await remoteNode.state()).find(isPayloadOfSchemaType<ModuleDescriptionPayload>(ModuleDescriptionSchema))
    expect(description?.children).toBeArray()
    expect(description?.children?.length).toBeGreaterThan(0)
    expect(description?.queries).toBeArray()
    expect(description?.queries?.length).toBeGreaterThan(0)

    // Works if you supply the known address for 'Archivist'
    // const [archivistByAddress] = await memNode.resolve({ address: ['461fd6970770e97d9f66c71658f4b96212581f0b'] })
    // expect(archivistByAddress).toBeDefined()

    /* const mods = await bridge.resolve('*')
    for (const mod of mods) {
      console.log(`module [${mod.address}]: ${mod.modName}`)
    } */

    const node = await bridge.resolve('XYOPublic')
    expect(node).toBeDefined()

    const archivistByName1 = await node?.resolve('Archivist')
    expect(archivistByName1).toBeDefined()

    const archivistByName2 = (await node?.resolve('Archivist'))
    expect(archivistByName2).toBeDefined()
    const payloadStatsDivinerByName = (await node?.resolve('PayloadStatsDiviner'))
    expect(payloadStatsDivinerByName).toBeDefined()
    const boundwitnessStatsDivinerByName = (await node?.resolve('BoundWitnessStatsDiviner'))
    expect(boundwitnessStatsDivinerByName).toBeDefined()
  })
})
