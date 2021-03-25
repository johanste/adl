#!/usr/bin/env node

// NOTE: For now, this script assumes it is being run from
//       the repo path packages/adl/.

import url from "url";
import mkdirp from "mkdirp";
import { spawnSync, fork } from "child_process";

// Get this from samples/ directory listing when reliable
const sampleFolders = [
  "documentation",
  "grpc-library-example",
  "grpc-kiosk-example",
  "nested",
  "nullable",
  "operations",
  "petstore",
  "recursive",
  "rpaas/liftr.confluent",
  "tags",
  "testserver/media-types",
  "testserver/body-boolean",
  "testserver/body-time",
  "visibility",
];

function resolvePath(...parts) {
  const resolvedPath = new url.URL(parts.join(""), import.meta.url);
  return url.fileURLToPath(resolvedPath);
}

for (const folderName of sampleFolders) {
  const inputPath = `samples/${folderName}`;
  const outputPath = resolvePath("../test/output/", folderName);
  mkdirp(outputPath);

  console.log(`\nExecuting \`adl compile ${inputPath}\``);
  const ret = spawnSync(
    process.execPath,
    ["dist/compiler/cli.js", "compile", inputPath, `--output-path=${outputPath}`, `--debug`],
    {
      stdio: ["inherit", "pipe", "inherit"],
    }
  );

  if (ret.error) {
    throw ret.error;
  }

  if (ret.status != 0) {
    throw new Error("Compilation failed");
  }
}
