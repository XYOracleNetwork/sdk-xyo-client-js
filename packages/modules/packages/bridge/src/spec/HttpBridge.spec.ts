import { AxiosJson } from '@xyo-network/axios'
import { NodeWrapper } from '@xyo-network/node'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

test('HttpBridge', async () => {
  const nodeUri = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'

  const bridge = await HttpBridge.create({
    axios: new AxiosJson(),
    config: { nodeUri, schema: HttpBridgeConfigSchema, targetAddress: '5111228f724a066ac060fe2e6c8bbaae44b107d5' },
  })
  const wrapper = NodeWrapper.wrap(bridge)
  const description = await wrapper.describe()
  expect(description.children).toBeArray()
  expect(description.children?.length).toBeGreaterThan(0)
  expect(description.queries).toBeArray()
  expect(description.queries?.length).toBeGreaterThan(0)
})
