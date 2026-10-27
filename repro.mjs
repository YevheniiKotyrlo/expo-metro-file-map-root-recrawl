import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const FileMap = require('@expo/metro-file-map').default;
const { Watcher } = require('@expo/metro-file-map/build/Watcher.js');

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, 'project');
const roots = [rootDir, join(here, 'packages')];

const fileMap = new FileMap({
  extensions: ['js', 'json'],
  healthCheck: { enabled: false, interval: 0, timeout: 0, filePrefix: '' },
  maxWorkers: 1,
  resetCache: true,
  retainAllFiles: true,
  rootDir,
  roots,
  useWatchman: false,
  watch: false,
});
const { fileSystem } = await fileMap.build();
console.log('files in the map:', fileSystem.getAllFiles().length);

const watcher = new Watcher({
  abortSignal: new AbortController().signal,
  computeSha1: false,
  console,
  enableSymlinks: false,
  extensions: ['js', 'json'],
  healthCheckFilePrefix: null,
  ignoreForCrawl: () => false,
  ignorePatternForWatch: null,
  perfLogger: null,
  previousState: { clocks: new Map(), fileSystem },
  rootDir,
  roots,
  useWatchman: false,
  watch: false,
  watchmanDeferStates: [],
});

// FileMap recrawls a folder a watcher reports with the folder's path relative to rootDir, which is '' for rootDir itself.
for (const subpath of ['../packages', '']) {
  const { removedFiles } = await watcher.recrawl(subpath, fileSystem);
  console.log(`recrawl of '${subpath}' removes ${removedFiles.size} files:`, [...removedFiles]);
}
await fileMap.end();
