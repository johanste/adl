#!/usr/bin/env node

// NOTE: For now, this script assumes it is being run from
//       the repo path packages/adl/.

import url from "url";
import mkdirp from "mkdirp";
import { spawnSync, fork } from "child_process";

// Get this from samples/ directory listing when reliable
const sampleFolders = [
  "petstore",
  "confluent",
  "documentation",
  "nullable",
  "tags",
  "testserver/media-types",
  "testserver/body-boolean",
  "visibility"
];

function resolvePath(...parts) {
  const resolvedPath = new url.URL(parts.join(''), import.meta.url);
  return url.fileURLToPath(resolvedPath);
}

async function runCompilerAsync(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const cliProcess = fork("../dist/compiler/cli.js", ["compile", inputPath, `--output-path=${outputPath}`]);

    cliProcess.on('close', (code) => {
      console.log("process exit", code);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cliProcess.stderr}`));
      }
    });
  })
}

for (const folderName of sampleFolders) {
  const inputPath = `samples/${folderName}`
  const outputPath = resolvePath("../test/output/", folderName);
  mkdirp(outputPath);

  console.log(`\nExecuting \`adl compile ${inputPath}\``)
  spawnSync(process.execPath, [
    "dist/compiler/cli.js",
    "compile",
    inputPath,
    `--output-path=${outputPath}`
  ], {
    stdio: ['inherit', 'pipe', 'inherit']
  });
}
