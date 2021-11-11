import React, { useCallback, useState } from 'react'
import { pipe, loadSDK, removeSpaces, split, andThen } from '../utils'

const extensionsToArray = pipe(removeSpaces, split(','))

const buildExtensions = (extensions) =>
  typeof extensions === 'string' ? extensionsToArray(extensions) : extensions

const prepareDropboxProps = (props) => {
  const { success, cancel, linkType, multiselect, extensions } = props
  return {
    success,
    cancel,
    linkType,
    multiselect,
    extensions: buildExtensions(extensions)
  }
}

const loadDropboxSdk = (appKey) =>
  loadSDK(() => window.Dropbox)({
    url: 'https://www.dropbox.com/static/api/2/dropins.js',
    attrs: {
      id: 'dropboxjs',
      'data-app-key': appKey
    }
  })

const Dropbox = (appKey) => ({
  flatMap: (fn) => loadDropboxSdk(appKey).then(fn)
})

export const openDropbox = ({ appKey, ...dropBoxOptions } = {}) =>
  new Promise((resolve) =>
    Dropbox(appKey).flatMap((dropbox) => {
      dropbox.choose(prepareDropboxProps(dropBoxOptions))
      resolve()
    })
  )

export const canOpenDropbox = ({ appKey = '' } = {}) => {
  const openConfiguredDropbox = (props = {}) =>
    openDropbox({ appKey, ...props })
  return (Component) => {
    return (props) => {
      const [isDropboxLoading, setIsDropboxLoading] = useState()
      const _openDropbox = useCallback(
        pipe(
          () => setIsDropboxLoading(true),
          () => openConfiguredDropbox(props),
          andThen(() => setIsDropboxLoading(false))
        ),
        []
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
}
