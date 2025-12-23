import type { Address } from '@xylabs/sdk-js'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import {
  describe, expect, test,
} from 'vitest'

const rootNodeName = 'root'
const nodeAName = 'nodeA'
const nodeBName = 'nodeB'
const moduleAName = 'module'
const moduleBName = 'module'
const moduleCName = 'moduleC'

/**
 * @group module
 */

describe('SimpleModuleResolverDeep', () => {
  test('two archivists same name, different nodes', async () => {
    const rootNode = await MemoryNode.create({ account: 'random', config: { name: rootNodeName, schema: NodeConfigSchema } })
    const nodeA = await MemoryNode.create({ account: 'random', config: { name: nodeAName, schema: NodeConfigSchema } })
    const nodeB = await MemoryNode.create({ account: 'random', config: { name: nodeBName, schema: NodeConfigSchema } })
    const moduleA = await MemoryArchivist.create({ account: 'random', config: { name: moduleAName, schema: ArchivistConfigSchema } })
    const moduleB = await MemoryArchivist.create({ account: 'random', config: { name: moduleBName, schema: ArchivistConfigSchema } })
    const moduleC = await MemoryArchivist.create({ account: 'random', config: { name: moduleCName, schema: ArchivistConfigSchema } })

    await nodeA.register(moduleA)
    await nodeA.attach(moduleA.address, true)

    const resolvedModuleAFromNodeA = await nodeA.resolve(moduleAName)
    expect(resolvedModuleAFromNodeA?.address).toBe(moduleA.address)

    await nodeB.register(moduleB)
    await nodeB.register(moduleC)
    await nodeB.attach(moduleB.address, true)
    await nodeB.attach(moduleC.address)

    const resolvedModuleBFromNodeB = await nodeB.resolve(moduleBName)
    expect(resolvedModuleBFromNodeB?.address).toBe(moduleB.address)

    await rootNode.register(nodeA)
    await rootNode.attach(nodeA.address, true)
    await rootNode.register(nodeB)
    await rootNode.attach(nodeB.address, true)

    const rootNodeResolve = await rootNode.resolve(`${rootNodeName}`)
    expect(rootNodeResolve?.address).toBe(rootNode.address)

    const resolvedModuleA = await rootNode.resolve(moduleAName)
    expect([moduleA.address, moduleB.address].includes(resolvedModuleA?.address ?? '' as Address)).toBe(true)
    const resolvedModuleB = await rootNode.resolve(moduleBName)
    expect([moduleA.address, moduleB.address].includes(resolvedModuleB?.address ?? '' as Address)).toBe(true)

    const resolvedModuleAMulti = await rootNode.resolve(`${nodeAName}:${moduleAName}`)
    expect(resolvedModuleAMulti?.address).toBe(moduleA.address)
    const resolvedModuleBMulti = await rootNode.resolve(`${nodeBName}:${moduleBName}`)
    expect(resolvedModuleBMulti?.address).toBe(moduleB.address)

    const resolvedModuleAMultiTooFar = await rootNode.resolve(`${rootNodeName}:${moduleAName}`)
    expect(!!resolvedModuleAMultiTooFar).toBe(false)
  })
})
