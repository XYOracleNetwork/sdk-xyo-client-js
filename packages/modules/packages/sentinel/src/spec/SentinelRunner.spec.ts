import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { SimpleModuleResolver } from '@xyo-network/module'
import { IdSchema, IdWitness, IdWitnessConfigSchema } from '@xyo-network/plugins'
import { AbstractWitness } from '@xyo-network/witness'

import { AutomationSchema, SentinelIntervalAutomationPayload } from '../Automation'
import { Sentinel, SentinelConfig, SentinelConfigSchema } from '../Sentinel'
import { OnSentinelRunnerTriggerResult, SentinelRunner } from '../SentinelRunner'

describe('SentinelRunner', () => {
  let sentinel: Sentinel
  let config: SentinelConfig

  beforeEach(async () => {
    const witnesses: AbstractWitness[] = [await IdWitness.create({ config: { salt: 'test', schema: IdWitnessConfigSchema } })]
    const resolver = new SimpleModuleResolver()
    witnesses.forEach((witness) => resolver.add(witness))

    config = {
      schema: SentinelConfigSchema,
      witnesses: witnesses.map((witness) => witness.address),
    }

    sentinel = await Sentinel.create({ config, resolver })
  })

  it('should output interval results', async () => {
    const intervalAutomation: SentinelIntervalAutomationPayload = {
      frequency: 1,
      frequencyUnits: 'minute',
      remaining: 1,
      schema: AutomationSchema,
      start: Date.now() - 1,
      type: 'interval',
      witnesses: config.witnesses,
    }
    const onTriggerResult: OnSentinelRunnerTriggerResult = (results) => {
      expect(results.length).toBe(2)
      expect(results[0]?.schema).toBe(XyoBoundWitnessSchema)
      expect(results[1].length).toBe(1)
      expect(results[1]?.[0].schema).toBe(IdSchema)
    }

    const runner = new SentinelRunner(sentinel, [intervalAutomation], onTriggerResult)
    await runner.start()
  })
})
