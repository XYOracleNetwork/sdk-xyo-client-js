import axios, { AxiosResponseTransformer } from 'axios'

export const locationDivinerApiResponseTransformer: AxiosResponseTransformer = (data, _headers) => {
  return data.data
}

/**
 * Gets the response transformers for the LocationDiviner API. Done as a method instead of a property
 * to allow detection of dynamically added response transformers.
 * @param axiosInstance The axios instance (defaults to the global instance if none provided)
 * @returns the response transformers for the LocationDiviner API
 */
export const getLocationDivinerApiResponseTransformer = (axiosInstance = axios): AxiosResponseTransformer[] => {
  // If there's any existing response transforms preserve them and
  // append our response transform, otherwise just return ours
  return axiosInstance.defaults.transformResponse
    ? ([] as AxiosResponseTransformer[]).concat(
        axiosInstance.defaults.transformResponse,
        locationDivinerApiResponseTransformer
      )
    : [locationDivinerApiResponseTransformer]
}
