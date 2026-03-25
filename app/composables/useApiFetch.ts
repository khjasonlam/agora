import type { NitroFetchRequest } from 'nitropack'
import type { UseFetchOptions } from 'nuxt/app'

export function useApiFetch<T>(url: NitroFetchRequest, options: UseFetchOptions<T> = {} as UseFetchOptions<T>) {
  const headers = useRequestHeaders(['cookie'])
  return useFetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  } as typeof options)
}
