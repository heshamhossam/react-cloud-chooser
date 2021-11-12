React cloud chooser
============
react [Dropbox Chooser API](https://www.dropbox.com/developers/chooser), google drive, one drive file browse chooser

Installation 
============
```
npm install react-cloud-chooser
```

Usage
=====
```
import { canOpenDropbox } from 'react-cloud-chooser'

const DtopboxBtn = ({ openDropbox, isDropboxLoading }) => (
  <button onClick={openDropbox}>
    Dropbox
    {isDropboxLoading && <span>...</span>}
  </button>
)
const DropboxOpenBtn = canOpenDropbox(DtopboxBtn)

<DropboxOpenBtn
  appKey="__app_key__"
  multiselect={false}
  linkType='direct' // either direct or preview
  success={(files) => console.log(files)}
  cancel={() => console.log('cancel pressed')}
  extensions='.pdf,.jpg'
/>
```