import { AxiosJson } from '@xyo-network/axios'

let axios: AxiosJson

export const getRequestClient = () => {
  if (axios) return axios
  const baseURL = process.env.API_DOMAIN
  axios = new AxiosJson({ baseURL })
  return axios
}
