# Build Instructions

Prerequisites: 
1. [Node.js](https://nodejs.org/en/download/) (>=14.0.0 <15.0.0)

2. [Rush](https://rushjs.io/pages/intro/welcome/) 

```
npm install -g @microsoft/rush
```

## Preparation

The first time (or after pulling from upstream) use Rush to install project
dependencies.

```
rush update 
```

## Building the code

 - `rush rebuild` to build the modules
 or
 - `rush watch` to setup the build watcher 
 or
 - in VSCode, just build (ctrl-shift-b)

## Publishing a release

To publish a release of the packages in this repository, first create a branch
starting with `publish/` (e.g. `publish/0.4.0`) and run the following command:

```
rush publish --apply
```

This will bump versions across all packages and update changelogs *without*
publishing the packages to `npm`.  Stage all of the changed files, commit them,
and then send a PR.  Once the PR is merged, the updated packages will
automatically be published to `npm`.

**NOTE:** The `publish/` prefix is necessary to prevent `rush change -v` from
being run in the release preparation PR!
