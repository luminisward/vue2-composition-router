import { computed, getCurrentInstance } from '@vue/composition-api'
import isEqual from 'lodash/isEqual'
import pathToRegexp from 'path-to-regexp'
import { Route } from 'vue-router'
import { Dictionary } from 'vue-router/types/router'

type RouteQuery = Route['query'][string]
type RouteParam = string | null | undefined

const _getCurrentInstance = () => {
  const vm = getCurrentInstance()
  if (!vm) throw new Error('must be called in setup')
  return vm
}

const getRouteParamsKeys = (route: Route) =>
  route.matched.map((item) => pathToRegexp(item.path).keys.map(({ name }) => name)).flat()

export const useRouter = () => {
  const vm = _getCurrentInstance()
  return vm.proxy.$router
}

export const useRoute = () => {
  const router = useRouter()
  const vm = _getCurrentInstance()
  return computed({
    get: () => vm.proxy.$route,
    set: (value) => {
      const old = vm.proxy.$route
      if (isEqual(value, old)) {
        return
      }
      router.replace({ ...value, name: value.name ?? undefined })
    },
  })
}

export const useRouteQueries = () => {
  const route = useRoute()
  return computed<Dictionary<RouteQuery>>({
    get: () => route.value.query,
    set: (query) => {
      route.value = { ...route.value, query }
    },
  })
}

export const useRouteQuery = (name: string) => {
  const query = useRouteQueries()
  return computed({
    get: () => query.value[name],
    set: (val) => {
      query.value = { ...query.value, [name]: val }
    },
  })
}

export const useRouteParams = () => {
  const route = useRoute()
  return computed<Dictionary<RouteParam>>({
    get: () => route.value.params,
    set: (val) => {
      const routeParamKeys = getRouteParamsKeys(route.value)
      const params = Object.entries(val).reduce<Dictionary<string>>(
        (p, [key, value]) => {
          if (routeParamKeys.includes(key)) {
            if (value !== null && value !== undefined && value !== '') {
              return { ...p, [key]: String(value) }
            } else {
              return p
            }
          } else {
            console.warn('"' + key + '" not in route params: ' + JSON.stringify(routeParamKeys))
            return p
          }
        },
        routeParamKeys.reduce((p, k) => ({ ...p, [k]: undefined }), {})
      )
      route.value = { ...route.value, params }
    },
  })
}

export const useRouteParam = (name: string) => {
  const params = useRouteParams()
  return computed({
    get: () => params.value[name],
    set: (val) => {
      params.value = { ...params.value, [name]: val }
    },
  })
}

export const useRouteParamOrQuery = (name: string) => {
  const route = useRoute()
  const params = useRouteParams()
  const queries = useRouteQueries()

  return computed<RouteParam | RouteQuery>({
    get: () => {
      return { ...queries.value, ...params.value }[name]
    },
    set: (val) => {
      const routeParamKeys = getRouteParamsKeys(route.value)
      if (routeParamKeys.includes(name)) {
        if (Array.isArray(val)) {
          throw new Error("param can't be array")
        }
        params.value = { ...params.value, [name]: val }
      } else {
        if (val === undefined) {
          const { [name]: _, ...rest } = queries.value
          queries.value = rest
        } else {
          // @ts-ignore
          queries.value = { ...queries.value, [name]: val }
        }
      }
    },
  })
}
