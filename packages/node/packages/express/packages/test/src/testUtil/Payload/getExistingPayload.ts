import { AxiosJson } from '@xyo-network/axios'
import { PayloadWithMeta } from '@xyo-network/node-core-model'

export const getExistingPayloadByHash = async (hash: string): Promise<PayloadWithMeta> => {
  const baseURL = process.env.API_DOMAIN
  const axios = new AxiosJson({ baseURL })
  const response = await axios.get<PayloadWithMeta>(`/${hash}`)
  return response.data
}
