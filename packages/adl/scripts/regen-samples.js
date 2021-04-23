#!/usr/bin/env node

// NOTE: For now, this script assumes it is being run from
//       the repo path packages/adl/.

import url from "url";
import mkdirp from "mkdirp";
import { run } from "../../../eng/scripts/helpers.js";

// Get this from samples/ directory listing when reliable
const sampleFolders = [
  "documentation",
  "grpc-library-example",
  "grpc-kiosk-example",
  "nested",
  "nullable",
  "operations",
  "overloads",
  "petstore",
  "recursive",
  "rpaas/codesigning",
  "rpaas/servicelinker",
  "rpaas/liftr.confluent",
  "rpaas/liftr.frs",
  "rpaas/logz",
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
  const inputPath = `../adl-samples/${folderName}`;
  const outputPath = resolvePath("../test/output/", folderName);
  mkdirp(outputPath);

  run(process.execPath, [
    "dist/compiler/cli.js",
    "compile",
    inputPath,
    `--output-path=${outputPath}`,
    `--debug`,
  ]);
}
