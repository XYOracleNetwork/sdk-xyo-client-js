import axios, { AxiosResponseTransformer } from 'axios'

export const archivistApiResponseTransformer: AxiosResponseTransformer = (data, _headers) => {
  return data.data
}

export const getArchivistApiResponseTransformer = (): AxiosResponseTransformer[] => {
  // If there's any existing response transforms preserve them and
  // append our response transform, otherwise just return ours
  return axios.defaults.transformResponse
    ? ([] as AxiosResponseTransformer[]).concat(axios.defaults.transformResponse, archivistApiResponseTransformer)
    : [archivistApiResponseTransformer]
}
