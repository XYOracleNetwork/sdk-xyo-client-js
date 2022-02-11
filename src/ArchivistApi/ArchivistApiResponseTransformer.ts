import axios, { AxiosResponseTransformer } from 'axios'

export const archivistApiResponseTransformer: AxiosResponseTransformer = (data, _headers) => {
  return data.data
}

export const getArchivistApiResponseTransformer = (): AxiosResponseTransformer[] =>
  [archivistApiResponseTransformer].concat(axios.defaults.transformResponse || [])
