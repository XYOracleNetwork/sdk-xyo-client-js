import { delay } from '@xylabs/delay'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Account } from '@xyo-network/account'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { MemoryNode } from '@xyo-network/node-memory'
import { SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'

import { SentinelIntervalAutomationPayload, SentinelIntervalAutomationSchema } from '../Automation'
import { MemorySentinel } from '../MemorySentinel'
import { OnSentinelRunnerTriggerResult, SentinelRunner } from '../SentinelRunner'

/**
 * @group sentinel
 * @group module
 */

describe('SentinelRunner', () => {
  let sentinel: MemorySentinel
  let config: SentinelConfig

  beforeEach(async () => {
    const node = (await MemoryNode.create({ account: Account.randomSync() })) as MemoryNode
    const witnessModules: AbstractWitness[] = [
      await IdWitness.create({ account: Account.randomSync(), config: { salt: 'test', schema: IdWitnessConfigSchema } }),
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
      synchronous: true,
      tasks: witnesses.map((module) => ({ module })),
    }

    sentinel = (await MemorySentinel.create({ account: Account.randomSync(), config })) as MemorySentinel
    await node.register(sentinel)
    await node.attach(sentinel.address)
  })

  it('should output interval results', async () => {
    let triggered = false
    let timeoutCount = 10
    const intervalAutomation: SentinelIntervalAutomationPayload = {
      frequency: 1,
      frequencyUnits: 'second',
      remaining: 1,
      schema: SentinelIntervalAutomationSchema,
      start: Date.now() - 1,
      tasks: config.tasks,
      type: 'interval',
    }
    const onTriggerResult: OnSentinelRunnerTriggerResult = (results) => {
      triggered = true
      expect(results.length).toBe(2)
      expect(results[1]?.schema).toBe(IdSchema)
    }

    const runner = new SentinelRunner(sentinel, [intervalAutomation], onTriggerResult)
    await runner.start()
    while (timeoutCount) {
      if (triggered) {
        runner.stop()
        return
      }
      timeoutCount--
      await delay(100)
    }
    //should never get here if succeeded
    expect(false).toBe(true)
    runner.stop()
  })
})
