import React, { useCallback, useMemo, useState } from 'react'
import {
  pipe,
  ifElse,
  tap,
  andThen,
  withInsertScript,
  createInsertScriptTag,
  withInsertScript
} from '../utils'
import { gapiCallbackToPromise, createLoadGoogleDependencies } from './utils'

const DEFAULT_SCOPE = ['https://www.googleapis.com/auth/drive.readonly']

const insertGoogleApiScript = () => {
  const insertScriptTag = createInsertScriptTag()
  const insertGoogleApiScriptTag = insertScriptTag({
    url: 'https://apis.google.com/js/api.js'
  })
  const insertApiScript = createInsertApiScript({
    getApi: () => window.gapi,
    insertApiScriptTag: insertGoogleApiScriptTag
  })
  return insertApiScript()
}

export const createAuthorize =
  ({
    insertScript = insertGoogleApiScript,
    loadDependencies = createLoadGoogleDependencies()
  } = {}) =>
  ({ clientId, scope = DEFAULT_SCOPE, immediate = false }) =>
    pipe(
      insertScript,
      andThen(() => loadDependencies(['auth2'])),
      andThen(() =>
        gapiCallbackToPromise((cb) =>
          gapi.auth2.authorize(
            {
              clientId,
              scope,
              immediate
            },
            cb
          )
        )
      )
    )()

export const createOpenPicker =
  ({
    insertScript = insertGoogleApiScript,
    loadDependencies = createLoadGoogleDependencies()
  } = {}) =>
  ({
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
      insertScript,
      andThen(() => loadDependencies(['picker'])),
      andThen(
        ({ picker }) =>
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

    const googleScriptLoader = useMemo(
      () => withInsertScript({ insertScript: insertGoogleApiScript })({}),
      []
    )
    const getAccessToken = useCallback(
      createAuthorize({
        insertScript: googleScriptLoader.insertScript
      }),
      [googleScriptLoader]
    )
    const openPicker = useCallback(
      createOpenPicker({
        insertScript: googleScriptLoader.insertScript
      }),
      [googleScriptLoader]
    )
    const [isGoogleDriveLoading, setIsGoogleDriveLoading] = useState()

    const _openGoogleDrive = pipe(
      () => setIsGoogleDriveLoading(true),
      () =>
        token
          ? Promise.resolve({ access_token: token })
          : getAccessToken({ clientId, scope }).then(tap(onAuthorizeSuccess)),
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
