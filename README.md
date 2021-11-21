# react-cloud-chooser

> react implementation for [Google Drive Picker](https://developers.google.com/picker/docs), [OneDrive File Picker](https://docs.microsoft.com/en-us/onedrive/developer/controls/file-pickers/js-v72/open-file), [Dropbox Chooser API](https://www.dropbox.com/developers/chooser)

[![NPM](https://img.shields.io/npm/v/react-cloud-chooser.svg)](https://www.npmjs.com/package/react-cloud-chooser) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Description

react component wrapper for all cloud file storage services Dropbox, Google Drive picker, and OneDrive, which lazy loads the scripts needed only once you press the related buttons.

## Install
npm
```bash
npm install --save react-cloud-chooser
```
yarn
```bash
yarn add react-cloud-chooser
```

## Google Drive
It popups the login first then open google driver picker. 

```jsx
import React from 'react'

import { canOpenGoogleDrive } from 'react-cloud-chooser'

const GoogleDriveBtn = ({ openGoogleDrive, isGoogleDriveLoading }) => (
  <button onClick={openGoogleDrive}>
    Google Drive
    {isGoogleDriveLoading && <span>...</span>}
  </button>
)
const GoogleDriveOpenBtn = canOpenGoogleDrive(GoogleDriveBtn)

function GoogleDriveExample(props) {
  return (
    <GoogleDriveOpenBtn
      clientId='__client_id__'
      appId='__app_id__'
      developerKey='__developer_key__'
      success={console.log}
      mimeTypes="image/png,image/jpeg,image/jpg"
    />
  )
}

```

|    prop        |   value  |  default value   |          description          |
|------------------|----------|------------------|-------------------------------|
|    clientId      |  string  |     REQUIRED     |      Google client id         |
|    developerKey  |  string  |     REQUIRED     |      Google developer key     |
|    appId  |  string  |     REQUIRED     |      "Project number" on the "IAM & Admin"     |
|    mimeTypes  |  string  |     optional     |      Comma separated [mimetypes](https://developers.google.com/drive/api/v3/ref-export-formats) to filter files|
|  multiselect     |  boolean |     false        | Enable files multi select     |
|   token          |  string  |     optional     | access token which skips auth/login step|
|success|  (files) => {}  |     optional|function to call when files selected|
|cancel|  function  |     optional|function to call when cancel is pressed|
| scope      |string[]|    ['https://www.googleapis.com/auth/drive.readonly']     |  Array of scopes to auth then use in picker|
|mapViews|  function  |     (google) => [new google.picker.DocsView(google.picker.ViewId.DOCS), new google.picker.DocsUploadView()]|views to show as tabs in picker|
|mapPickerBuilder|  function  |     (pickerBuilder) => pickerBuilder|customize picker builder|

## OneDrive Usage

```jsx
import React from 'react'

import { canOpenOneDrive } from 'react-cloud-chooser'

const OneDriveBtn = ({ openOneDrive, isOneDriveLoading }) => (
  <button onClick={openOneDrive}>
    OneDrive
    {isOneDriveLoading && <span>...</span>}
  </button>
)
const OneDriveOpenBtn = canOpenOneDrive(OneDriveBtn)

function OneDriveExample(props) {
  return (
    <OneDriveOpenBtn
      clientId='__client_id__'
      action="query"
      success={console.log}
      cancel={() => console.log('cancel pressed')}
    />
  )
}

```
|    prop        |   value  |  default value   |          description          |
|------------------|----------|------------------|-------------------------------|
|    clientId      |  string  |     REQUIRED     |      OneDrive client id         |
|    action  |  string  |     query     |      action with files selected either "share" or "download" or "query"     |
|  multiselect     |  boolean |     false        | Enable files multi select     |
|  advanced     |  JSON |     optional        | advanced customization for the behavior of the picker,     |
|success|  (files) => {}  |     optional|function to call when files selected|
|cancel|  function  |     optional|function to call when closed without selecting|


## Dropbox Usage

```jsx
import React from 'react'

import { canOpenDropbox } from 'react-cloud-chooser'

const DtopboxBtn = ({ openDropbox, isDropboxLoading }) => (
  <button onClick={openDropbox}>
    Dropbox
    {isDropboxLoading && <span>...</span>}
  </button>
)
const DropboxOpenBtn = canOpenDropbox(DtopboxBtn)

function DropboxExample(props) {
  return (
    <DropboxOpenBtn
      appKey="__app_key__"
      linkType='direct' // either direct or preview
      success={console.log}
      extensions='.pdf,.jpg'
    />
  )
}

```
|    prop        |   value  |  default value   |          description          |
|------------------|----------|------------------|-------------------------------|
|    appKey      |  string  |     REQUIRED     |      Dropbox app key         |
|    linkType  |  string  |     preview     |      either direct or preview for the files selected     |
|    extensions  |  string  |     optional     |      file extensions to show only in dropbox     |
|  multiselect     |  boolean |     false        | Enable files multi select     |
|success|  (files) => {}  |     optional|function to call when files selected|
|cancel|  function  |     optional|function to call when cancel is pressed|

## Author and License

MIT © [Hesham Hossam](https://www.linkedin.com/in/hesham-hossam-hhh5993/) <heshamhossam57@gmail.com>