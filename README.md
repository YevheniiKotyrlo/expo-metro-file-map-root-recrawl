# A recrawl of the project root drops every other watch root from `@expo/metro-file-map`

`project/` is the file map's `rootDir`, and `packages/` is a second watch root beside it, as a monorepo's packages are
for an app's Metro. `repro.mjs` builds the map, then recrawls each root the way `FileMap` does when a watcher reports
a recrawl: with the folder's path relative to `rootDir`, which is `''` for `rootDir` itself.

```sh
npm install
node repro.mjs
```

Expected: neither recrawl removes anything, since no file changed.

Seen with `@expo/metro-file-map` 58.0.5 on Node 26.12.1:

```
files in the map: 3
recrawl of '../packages' removes 0 files: []
recrawl of '' removes 2 files: [ '..\\packages\\lib\\index.js', '..\\packages\\lib\\package.json' ]
```

`Watcher.recrawl` crawls only `rootDir` for the subpath `''`, but `TreeFS.getDifference` takes `''` as no subpath and
compares that crawl with the whole tree, so every file under the other roots comes back as removed.
