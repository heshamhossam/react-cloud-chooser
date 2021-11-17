import React, { useCallback, useMemo, useState } from 'react'
import {
  pipe,
  createInsertScriptTag,
  removeSpaces,
  split,
  andThen,
  withInsertScript,
  createInsertApiScript
} from '../utils'

const extensionsToArray = pipe(removeSpaces, split(','))

const buildExtensions = (extensions) =>
  typeof extensions === 'string' ? extensionsToArray(extensions) : extensions

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

export const createOpenDropbox =
  ({ insertScript = insertDropboxScript } = {}) =>
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

    const dropboxScriptInsert = useMemo(
      () =>
        withInsertScript({
          insertScript: insertDropboxScript
        })({}),
      []
    )
    const openDropbox = useCallback(
      createOpenDropbox({
        insertDropboxScript: dropboxScriptInsert.insertScript
      }),
      []
    )
    const [isDropboxLoading, setIsDropboxLoading] = useState()

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
