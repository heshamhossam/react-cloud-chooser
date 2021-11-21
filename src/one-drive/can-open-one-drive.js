import React, { useCallback, useState } from 'react'
import {
  pipe,
  createInsertScriptTag,
  andThen,
  withCachedPromiserRunner,
  ifElse
} from '../utils'

// insert onedrive script if onedrive not yet loaded in window
const createInsertOneDriveScript =
  ({
    getApi = () => window.OneDrive,
    insertScriptTag = createInsertScriptTag()
  } = {}) =>
  () =>
    ifElse(
      () => !getApi(),
      () =>
        insertScriptTag({
          url: 'https://js.live.net/v7.2/OneDrive.js'
        }).then(getApi),
      () => Promise.resolve(getApi())
    )

// create a function to open onedrive browser
export const createOpenOneDrive =
  ({
    insertScript = withCachedPromiserRunner({
      run: createInsertOneDriveScript()
    })().run
  } = {}) =>
  ({ clientId, action, multiselect, advanced = {} } = {}) =>
    pipe(
      insertScript,
      andThen(
        (onedrive) =>
          new Promise((resolve, reject) =>
            onedrive.open({
              clientId,
              action,
              multiSelect: multiselect,
              advanced,
              success: resolve,
              cancel: () => reject('cancelled'),
              error: reject
            })
          )
      )
    )()

const isLocationFromOneDrive = (location) =>
  location?.search?.search('oauth') !== -1 ||
  location?.hash?.search('access_token') !== -1
export const canOpenOneDrive = (Component) => {
  // cached onedrive script loader
  const cachedOneDriveScriptInsert = withCachedPromiserRunner({
    run: createInsertOneDriveScript()
  })({})

  // if page was redirected from onedrive then load script
  ifElse(
    () => isLocationFromOneDrive(window.location),
    cachedOneDriveScriptInsert.run
  )

  return (props) => {
    const { clientId, action = "query", multiselect, advanced, success, cancel } = props

    // open onedrive browser
    const openOneDrive = useCallback(
      createOpenOneDrive({ insertScript: cachedOneDriveScriptInsert.run }),
      []
    )

    const [isOneDriveLoading, setIsOneDriveLoading] = useState()

    // triggers loading, open the browser, and fire success/cancel callbacks
    const _openOneDrive = pipe(
      () => setIsOneDriveLoading(true),
      () =>
        openOneDrive({
          clientId,
          action,
          multiselect,
          advanced
        }),
      (openPromise) =>
        openPromise
          .then(success)
          .catch(cancel)
          .finally(() => setIsOneDriveLoading(false))
    )

    return (
      <Component
        {...props}
        openOneDrive={_openOneDrive}
        isOneDriveLoading={isOneDriveLoading}
      />
    )
  }
}
