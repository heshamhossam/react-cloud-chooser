import React from 'react'

import { canOpenDropbox, canOpenGoogleDrive } from 'react-cloud-chooser'

const DropboxBtn = ({ openDropbox, isDropboxLoading }) => (
  <button onClick={openDropbox}>
    Dropbox
    {isDropboxLoading && <span>...</span>}
  </button>
)
const GoogleDriveBtn = ({ openGoogleDrive, isGoogleDriveLoading }) => (
  <button onClick={openGoogleDrive}>
    Google Drive
    {isGoogleDriveLoading && <span>...</span>}
  </button>
)
const DropboxOpenBtn = canOpenDropbox(DropboxBtn)
const GoogleDriveOpenBtn = canOpenGoogleDrive(GoogleDriveBtn)

const App = () => {
  return (
    <>
      <DropboxOpenBtn
        appKey="__app_key__"
        success={(files) => console.log(files)}
        cancel={() => console.log('cancel pressed')}
        extensions='.pdf,.jpg'
      />
      <GoogleDriveOpenBtn
        clientId='__client_id__'
        appId='__app_id__'
        developerKey='__developer_key__'
        success={console.log}
        mimeTypes="image/png,image/jpeg,image/jpg"
      />
    </>
  )
}

export default App
