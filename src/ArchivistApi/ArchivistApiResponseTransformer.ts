import axios, { AxiosResponseTransformer } from 'axios'

export const archivistApiResponseTransformer: AxiosResponseTransformer = (data, _headers) => {
  return data.data
}

export const getArchivistApiResponseTransformer = (): AxiosResponseTransformer[] => {
  const transforms: AxiosResponseTransformer[] = []
  if (axios.defaults.transformResponse) {
    if (Array.isArray(axios.defaults.transformResponse)) {
      transforms.push(...axios.defaults.transformResponse)
    } else {
      transforms.push(axios.defaults.transformResponse)
    }
  }
  transforms.push(archivistApiResponseTransformer)
  return transforms
}
