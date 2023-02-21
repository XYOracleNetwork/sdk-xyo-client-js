import { AxiosJson } from '@xyo-network/axios'
import { NodeWrapper } from '@xyo-network/node'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

test('HttpBridge', async () => {
  const nodeUri = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  const targetAddress = ''

  const bridge = await HttpBridge.create({
    axios: new AxiosJson(),
    config: { nodeUri, schema: HttpBridgeConfigSchema, targetAddress },
  })
  const wrapper = NodeWrapper.wrap(bridge)
  const description = await wrapper.describe()
  expect(description.children).toBeArray()
  expect(description.children?.length).toBeGreaterThan(0)
  expect(description.queries).toBeArray()
  expect(description.queries?.length).toBeGreaterThan(0)
})
