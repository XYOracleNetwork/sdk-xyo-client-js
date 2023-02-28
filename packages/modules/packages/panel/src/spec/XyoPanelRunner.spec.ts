/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { CompositeModuleResolver } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import { IdSchema, IdWitness, IdWitnessConfigSchema } from '@xyo-network/plugins'
import { AbstractWitness } from '@xyo-network/witness'

import { XyoAutomationSchema, XyoPanelIntervalAutomationPayload } from '../Automation'
import { XyoPanel, XyoPanelConfig, XyoPanelConfigSchema } from '../XyoPanel'
import { OnTriggerResult, XyoPanelRunner } from '../XyoPanelRunner'

describe('XyoPanelRunner', () => {
  let panel: XyoPanel
  let config: XyoPanelConfig

  beforeEach(async () => {
    const node = await MemoryNode.create()
    const witnessModules: AbstractWitness[] = [await IdWitness.create({ config: { salt: 'test', schema: IdWitnessConfigSchema } })]
    const witnesses = await Promise.all(
      witnessModules.map(async (witness) => {
        await node.register(witness).attach(witness.address)
        return witness.address
      }),
    )

    config = {
      schema: XyoPanelConfigSchema,
      witnesses,
    }

    panel = await XyoPanel.create({ config })
    await node.register(panel).attach(panel.address)
  })

  it('should output interval results', async () => {
    const intervalAutomation: XyoPanelIntervalAutomationPayload = {
      frequency: 1,
      frequencyUnits: 'minute',
      remaining: 1,
      schema: XyoAutomationSchema,
      start: Date.now() - 1,
      type: 'interval',
      witnesses: config.witnesses,
    }
    const onTriggerResult: OnTriggerResult = (results) => {
      expect(results.length).toBe(2)
      expect(results[0]?.schema).toBe(XyoBoundWitnessSchema)
      expect(results[1].length).toBe(1)
      expect(results[1]?.[0].schema).toBe(IdSchema)
    }

    const runner = new XyoPanelRunner(panel, [intervalAutomation], onTriggerResult)
    await runner.start()
  })
})
