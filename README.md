# prototypo.js

[![Dependency Status](https://david-dm.org/byte-foundry/prototypo.js.svg?theme=shields.io)](https://david-dm.org/byte-foundry/prototypo.js)
[![devDependency Status](https://david-dm.org/byte-foundry/prototypo.js/dev-status.svg?theme=shields.io)](https://david-dm.org/byte-foundry/prototypo.js#info=devDependencies)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/byte-foundry/prototypo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/byte-foundry/prototypo.js.svg?branch=master)](https://travis-ci.org/byte-foundry/prototypo.js)

Font and type-design library with built-in canvas rendering and OTF export.
Based on [paper.js](https://github.com/paperjs/paper.js)'s API and [opentype.js](https://github.com/nodebox/opentype.js) capabilities.

## Install

`npm install prototypo.js`

## Contribute

Before starting to hack on this lib, you need to install its dev dependencies.
The `test.ptf` package isn't available on npm, you need to clone it and link it first.

In your workspace directory:
```bash
git clone git@github.com:byte-foundry/test.ptf.git
cd test.ptf
npm install
npm link
```

In prototypo.js directory:
```bash
npm link test.ptf
npm install
```
