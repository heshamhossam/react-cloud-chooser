import React, { useState } from 'react'
import { pipe, loadSDK, andThen, ifElse, tap, tapLog } from '../utils'

const DEFAULT_SCOPE = ['https://www.googleapis.com/auth/drive.readonly']

const gapiCallbackToPromise = (fn) =>
  new Promise((resolve, reject) =>
    fn((r) => (r?.error ? reject(r.error) : resolve(r)))
  )

const loadGoogleScript = () =>
  loadSDK(() => window.gapi)({
    url: 'https://apis.google.com/js/api.js'
  })

const loadGoogleDependencies =
  (gapi) =>
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
            : gapiCallbackToPromise((cb) => getLoader(gapi).load(validLibs, cb))
      )

    const loadLibs = gapiLoader({
      getLoader: (gapi) => gapi,
      isLibRelated: (lib) => !isClientLib(lib)
    })
    const loadClientLibs = gapiLoader({
      getLoader: (gapi) => gapi.client,
      isLibRelated: (lib) => isClientLib(lib)
    })

    return pipe(
      () =>
        hasClientLibs(libs) ? loadLibs([...libs, 'clinet']) : loadLibs(libs),
      (baseLoaderPromise) =>
        baseLoaderPromise.then(() =>
          hasClientLibs(libs) ? loadClientLibs(libs) : Promise.resolve()
        ),
      (clientLoaderPromise) => clientLoaderPromise.then(() => gapi)
    )()
  }

const makeAuthorizeService = (gapi) => {
  return pipe(
    () => loadGoogleDependencies(gapi)(['auth2']),
    andThen((gapi) => ({
      authorize: (authParams = {}) =>
        gapiCallbackToPromise((cb) => gapi.auth2.authorize(authParams, cb))
    }))
  )()
}

const makePickerService = (gapi) => {
  return pipe(
    () => loadGoogleDependencies(gapi)(['picker']),
    andThen(() => window.google.picker)
  )()
}

export const getAccessToken = ({
  clientId,
  scope = DEFAULT_SCOPE,
  immediate = false
}) =>
  pipe(
    () => loadGoogleScript(),
    andThen(makeAuthorizeService),
    andThen(({ authorize }) => authorize({ clientId, scope, immediate }))
  )()

export const openPicker = ({
  accessToken,
  appId,
  developerKey,
  viewId = 'DOCS',
  mimeTypes,
  hasFolders = false,
  canSelectFolders = false,
  locale = 'en',
  multiselect,
  supportDrives
}) => {
  const viewBuilder =
    ({ mimeTypes, hasFolders, canSelectFolders }) =>
    (view) => {
      ifElse(
        () => !!mimeTypes,
        () => view.setMimeTypes(mimeTypes)
      )
      ifElse(
        () => hasFolders || canSelectFolders,
        () => view.setSelectFolderEnabled(true)
      )
      return view
    }
  return pipe(
    () => loadGoogleScript(),
    andThen(makePickerService),
    andThen(
      (picker) =>
        new Promise((resolve) => {
          const buildView = viewBuilder({
            mimeTypes,
            hasFolders,
            canSelectFolders
          })

          const defaultView = buildView(
            new picker.DocsView(picker.ViewId[viewId])
          )
          const uploadView = buildView(new picker.DocsUploadView())

          const pickerBuilder = new picker.PickerBuilder()
            .setAppId(appId)
            .setOAuthToken(accessToken)
            .setDeveloperKey(developerKey)
            .setCallback(
              (r) => r?.action === picker.Action.PICKED && resolve(r)
            )
            .setLocale(locale)

          pickerBuilder.addView(defaultView)
          pickerBuilder.addView(uploadView)

          ifElse(
            () => !!multiselect,
            () =>
              pickerBuilder.enableFeature(picker.Feature.MULTISELECT_ENABLED)
          )

          ifElse(
            () => !!supportDrives,
            () => pickerBuilder.enableFeature(picker.Feature.SUPPORT_DRIVES)
          )
          pickerBuilder.build().setVisible(true)
        })
    )
  )()
}

export const canOpenGoogleDrive = (Component) => {
  return (props) => {
    const {
      clientId,
      scope = DEFAULT_SCOPE,
      onAuthorizeSuccess,
      cancel,
      token,
      appId,
      developerKey,
      viewId = 'DOCS',
      mimeTypes,
      hasFolders = false,
      canSelectFolders = false,
      locale = 'en',
      multiselect,
      supportDrives,
      success
    } = props

    const [isGoogleDriveLoading, setIsGoogleDriveLoading] = useState()

    const _openGoogleDrive = pipe(
      () => setIsGoogleDriveLoading(true),
      () =>
        token
          ? Promise.resolve({ access_token: token })
          : getAccessToken({ clientId, scope })
              .then(tap(onAuthorizeSuccess)),
      (accessPromise) =>
        accessPromise.then((token) =>
          openPicker({
            accessToken: token.access_token,
            appId,
            developerKey,
            viewId,
            mimeTypes,
            hasFolders,
            canSelectFolders,
            locale,
            multiselect,
            supportDrives
          })
        ),
      (pickerPromise) =>
        pickerPromise
          .then(success)
          .catch(cancel)
          .finally(() => setIsGoogleDriveLoading(false))
    )
    return (
      <Component
        {...props}
        openGoogleDrive={_openGoogleDrive}
        isGoogleDriveLoading={isGoogleDriveLoading}
      />
    )
  }
}
