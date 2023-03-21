import { AxiosJson } from '@xyo-network/axios'
import { Payload } from '@xyo-network/payload-model'

export const getExistingPayloadByHash = async <T extends Payload = Payload>(hash: string): Promise<T> => {
  const baseURL = process.env.API_DOMAIN
  const axios = new AxiosJson({ baseURL })
  const response = await axios.get<T>(`/${hash}`)
  return response.data
}
