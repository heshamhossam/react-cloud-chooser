import React from 'react'

import { canOpenDropbox } from 'react-cloud-chooser'

const DtopboxBtn = ({ openDropbox, isDropboxLoading }) => (
  <button onClick={openDropbox}>
    Dropbox
    {isDropboxLoading && <span>...</span>}
  </button>
)

const connectOpenDropbox = canOpenDropbox({ appKey: '__app_key__' })
const DropboxOpenBtn = connectOpenDropbox(DtopboxBtn)

const App = () => {
  return (
    <DropboxOpenBtn
      multiselect={false}
      linkType='direct' // either direct or preview
      success={(files) => console.log(files)}
      cancel={() => console.log('cancel pressed')}
      extensions='.pdf,.jpg'
    />
  )
}

export default App
