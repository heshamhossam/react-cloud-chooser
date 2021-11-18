import React, { useCallback, useMemo, useState } from 'react'
import {
  pipe,
  createInsertScriptTag,
  removeSpaces,
  split,
  andThen,
  withCachedPromiserRunner,
  createInsertApiScript
} from '../utils'

const extensionsToArray = pipe(removeSpaces, split(','))
// ensure extensions is an array
const buildExtensions = (extensions) =>
  typeof extensions === 'string' ? extensionsToArray(extensions) : extensions

// insert dropbox script if dropbox not yet loaded in window
const insertDropboxScript = (appKey) => {
  const insertScriptTag = createInsertScriptTag()
  const insertDropboxScriptTag = insertScriptTag({
    url: 'https://www.dropbox.com/static/api/2/dropins.js',
    attrs: {
      id: 'dropboxjs',
      'data-app-key': appKey
    }
  })
  const insertApiScript = createInsertApiScript({
    getApi: () => window.Dropbox,
    insertApiScriptTag: insertDropboxScriptTag
  })
  return insertApiScript()
}
// create a function to open dropbox browser
export const createOpenDropbox =
  ({
    insertScript = withCachedPromiserRunner({ run: insertDropboxScript })().run
  } = {}) =>
  ({ appKey, linkType, multiselect, extensions } = {}) =>
    pipe(
      () => insertScript(appKey),
      andThen(
        (dropbox) =>
          new Promise((resolve, reject) =>
            dropbox.choose({
              linkType,
              multiselect,
              extensions: buildExtensions(extensions),
              success: resolve,
              cancel: reject
            })
          )
      )
    )()

export const canOpenDropbox = (Component) => {
  return (props) => {
    const { appKey, success, cancel, linkType, multiselect, extensions } = props

    // open dropbox browser
    const openDropbox = useCallback(createOpenDropbox(), [])
    
    const [isDropboxLoading, setIsDropboxLoading] = useState()

    // triggers loading, open the browser, and fire success/cancel callbacks
    const _openDropbox = pipe(
      () => setIsDropboxLoading(true),
      () =>
        openDropbox({
          appKey,
          linkType,
          multiselect,
          extensions
        }),
      (openPromise) =>
        openPromise
          .then(success)
          .catch(cancel)
          .finally(() => setIsDropboxLoading(false))
    )
    return (
      <Component
        {...props}
        openDropbox={_openDropbox}
        isDropboxLoading={isDropboxLoading}
      />
    )
  }
}
