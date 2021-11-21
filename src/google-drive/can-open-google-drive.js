import React, { useCallback, useMemo, useState } from 'react'
import {
  pipe,
  ifElse,
  tap,
  andThen,
  withCachedPromiserRunner,
  createInsertScriptTag
} from '../utils'
import { gapiCallbackToPromise, createLoadGoogleDependencies } from './utils'

const DEFAULT_SCOPE = ['https://www.googleapis.com/auth/drive.readonly']

// insert gapi script if not yet loaded in window
const createInsertGoogleApiScript =
  ({
    getApi = () => window.gapi,
    insertScriptTag = createInsertScriptTag()
  } = {}) =>
  () =>
    ifElse(
      () => !getApi(),
      () =>
        insertScriptTag({
          url: 'https://apis.google.com/js/api.js'
        }).then(getApi),
      () => Promise.resolve(getApi())
    )

// function that triggers oauth login to get access token
export const createAuthorize =
  ({
    insertScript = withCachedPromiserRunner({
      run: createInsertGoogleApiScript()
    })().run,
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
    insertScript = withCachedPromiserRunner({
      run: createInsertGoogleApiScript()
    })().run,
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
  }) => {
    const openPicker = ({ google }) =>
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
            pickerBuilder.enableFeature(
              google.picker.Feature.MULTISELECT_ENABLED
            )
        )
        // let user config picker builder then show it
        mapPickerBuilder(pickerBuilder).build().setVisible(true)
      })

    return pipe(
      insertScript,
      andThen(() => loadDependencies(['picker'])),
      andThen(openPicker)
    )()
  }

export const canOpenGoogleDrive = (Component) => {
  // cache google script insert to ensure running once
  const cachedGoogleApiScriptInsert = withCachedPromiserRunner({
    run: createInsertGoogleApiScript()
  })({})

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
    // login and get access token
    const getAccessToken = useCallback(
      createAuthorize({
        insertScript: cachedGoogleApiScriptInsert.run
      }),
      [cachedGoogleApiScriptInsert]
    )
    // open google drive picker
    const openPicker = useCallback(
      createOpenPicker({
        insertScript: cachedGoogleApiScriptInsert.run
      }),
      [cachedGoogleApiScriptInsert]
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
