# Callbag Group operator

A callbag operator that group data in chunks of a given size

## Install

`npm install callbag-group`

## Example

```js
const iterate = require('callbag-iterate');
const range = require('callbag-range');
const group = require('callbag-group');

const source = range(1, 10);
const groupedSource = group(5)(source);

iterate((x) => {
  console.log(x);
})(source);

// Prints:
// [1,2,3,4,5]
// [6,7,8,9,10]
```
