import { HDWallet } from '@xyo-network/account'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { MemoryNode } from '@xyo-network/node'
import { AbstractWitness } from '@xyo-network/witness'

import { SentinelAutomationSchema, SentinelIntervalAutomationPayload } from '../Automation'
import { SentinelConfig, SentinelConfigSchema } from '../Config'
import { MemorySentinel } from '../MemorySentinel'
import { OnSentinelRunnerTriggerResult, SentinelRunner } from '../SentinelRunner'

describe('SentinelRunner', () => {
  let sentinel: MemorySentinel
  let config: SentinelConfig

  beforeEach(async () => {
    const node = (await MemoryNode.create({ account: await HDWallet.random() })) as MemoryNode
    const witnessModules: AbstractWitness[] = [
      await IdWitness.create({ account: await HDWallet.random(), config: { salt: 'test', schema: IdWitnessConfigSchema } }),
    ]
    const witnesses = await Promise.all(
      witnessModules.map(async (witness) => {
        await node.register(witness)
        await node.attach(witness.address)
        return witness.address
      }),
    )

    config = {
      schema: SentinelConfigSchema,
      witnesses,
    }

    sentinel = (await MemorySentinel.create({ account: await HDWallet.random(), config })) as MemorySentinel
    await node.register(sentinel)
    await node.attach(sentinel.address)
  })

  it('should output interval results', async () => {
    const intervalAutomation: SentinelIntervalAutomationPayload = {
      frequency: 1,
      frequencyUnits: 'second',
      remaining: 1,
      schema: SentinelAutomationSchema,
      start: Date.now() - 1,
      type: 'interval',
      witnesses: config.witnesses,
    }
    const onTriggerResult: OnSentinelRunnerTriggerResult = (results) => {
      expect(results.length).toBe(2)
      expect(results[0]?.schema).toBe(BoundWitnessSchema)
      expect(results[1]?.schema).toBe(IdSchema)
    }

    const runner = new SentinelRunner(sentinel, [intervalAutomation], onTriggerResult)
    await runner.start()
  })
})
