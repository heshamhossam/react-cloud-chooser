import { pipe, andThen } from '../utils'

export const gapiCallbackToPromise = (fn) =>
  new Promise((resolve, reject) =>
    fn((r) => (r?.error ? reject(r.error) : resolve(r)))
  )

export const createLoadGoogleDependencies =
  ({
    getGoogleApi = () => window?.gapi,
    getPickerApi = () => window?.google
  } = {}) =>
  (libs = []) => {
    const isClientLib = (lib) => ['drive'].includes(lib)
    const formatLibs = (libs = []) => libs.join(',')
    const hasClientLibs = (libs) => libs.filter(isClientLib).length > 0

    const gapiLoader = ({ getLoader, isLibRelated }) =>
      pipe(
        (libs = []) => libs.filter(isLibRelated),
        // format already loaded ones
        (libs = []) => libs.filter((lib) => !getLoader()?.[lib]),
        formatLibs,
        (validLibs) =>
          !validLibs
            ? Promise.resolve()
            : gapiCallbackToPromise((cb) => getLoader().load(validLibs, cb))
      )

    const loadParentLibs = gapiLoader({
      getLoader: getGoogleApi,
      isLibRelated: (lib) => !isClientLib(lib)
    })
    const loadClientLibs = gapiLoader({
      getLoader: () => getGoogleApi().client,
      isLibRelated: (lib) => isClientLib(lib)
    })

    return pipe(
      () =>
        hasClientLibs(libs)
          ? loadParentLibs([...libs, 'clinet'])
          : loadParentLibs(libs),
      andThen(() =>
        hasClientLibs(libs) ? loadClientLibs(libs) : Promise.resolve()
      ),
      andThen(() => ({
        gapi: getGoogleApi(),
        google: getPickerApi()
      }))
    )()
  }
