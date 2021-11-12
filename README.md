# react-cloud-chooser

> react [Dropbox Chooser API](https://www.dropbox.com/developers/chooser), google drive, one drive file browse chooser

[![NPM](https://img.shields.io/npm/v/react-cloud-chooser.svg)](https://www.npmjs.com/package/react-cloud-chooser) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-cloud-chooser
```

## Usage

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
      multiselect={false}
      linkType='direct' // either direct or preview
      success={(files) => console.log(files)}
      cancel={() => console.log('cancel pressed')}
      extensions='.pdf,.jpg'
    />
  )
}

```

## License

MIT © [Hesham Hossam <heshamhossam57@gmail.com>](https://github.com/heshamhossam)
