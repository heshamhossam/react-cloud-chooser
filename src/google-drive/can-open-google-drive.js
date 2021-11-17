import React, { useCallback, useMemo, useState } from 'react'
import {
  pipe,
  ifElse,
  tap,
  andThen,
  withInsertScript,
  createInsertScriptTag,
  createInsertApiScript
} from '../utils'
import { gapiCallbackToPromise, createLoadGoogleDependencies } from './utils'

const DEFAULT_SCOPE = ['https://www.googleapis.com/auth/drive.readonly']

// insert gapi script if not yet loaded in window
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

// function that triggers oauth login to get access token 
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

// function that open google drive picker
export const createOpenPicker =
  ({
    insertScript = insertGoogleApiScript,
    loadDependencies = createLoadGoogleDependencies()
  } = {}) =>
  ({
    accessToken,
    appId,
    developerKey,
    mimeTypes,
    multiselect,
    mapViews = (google) => [
      new google.picker.DocsView(google.picker.ViewId.DOCS),
      new google.picker.DocsUploadView()
    ],
    mapPickerBuilder = (pickerBuilder) => pickerBuilder
  }) =>
    pipe(
      insertScript,
      andThen(() => loadDependencies(['picker'])),
      andThen(
        ({ google }) =>
          new Promise((resolve) => {
            const pickerBuilder = new google.picker.PickerBuilder()
              .setAppId(appId)
              .setOAuthToken(accessToken)
              .setDeveloperKey(developerKey)
              .setCallback(
                (r) => r?.action === google.picker.Action.PICKED && resolve(r)
              )
            // config mime types then add views to builder
            mapViews(google)
              .map((view) => {
                ifElse(
                  () => !!mimeTypes,
                  () => view.setMimeTypes(mimeTypes)
                )
                return view
              })
              .forEach((view) => pickerBuilder.addView(view))
            // config multi select
            ifElse(
              () => !!multiselect,
              () =>
                pickerBuilder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            )
            // let user config picker builder then show it
            mapPickerBuilder(pickerBuilder).build().setVisible(true)
          })
      )
    )()

export const canOpenGoogleDrive = (Component) => {
  return (props) => {
    const {
      clientId,
      scope = DEFAULT_SCOPE,
      onAuthorizeSuccess,
      success,
      cancel,
      token,
      appId,
      developerKey,
      mimeTypes,
      multiselect,
      mapViews,
      mapPickerBuilder
    } = props
    // cache script loader promise 
    const googleScriptLoader = useMemo(
      () => withInsertScript({ insertScript: insertGoogleApiScript })({}),
      []
    )
    // login and get access token
    const getAccessToken = useCallback(
      createAuthorize({
        insertScript: googleScriptLoader.insertScript
      }),
      [googleScriptLoader]
    )
    // open google drive picker
    const openPicker = useCallback(
      createOpenPicker({
        insertScript: googleScriptLoader.insertScript
      }),
      [googleScriptLoader]
    )
    // loading flag
    const [isGoogleDriveLoading, setIsGoogleDriveLoading] = useState()

    // get token then open drive picker based on props
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
            mimeTypes,
            multiselect,
            mapViews,
            mapPickerBuilder
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
