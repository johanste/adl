import { Dictionary, JsonReference, v2, vendorExtensions } from '@azure-tools/openapi';
import { use } from '@azure-tools/sourcemap';
import { ApiModel } from '../../../model/api-model';
import { Host } from '../../../support/file-system';
import { Context as Ctx, Visitor } from '../../../support/visitor';
import { singleOrDefault } from '../common';
import { processExternalDocs, processInfo, processTag } from '../common/info';
import { authentication, authenticationRequirement } from './security';
import { processServers } from './server';

// node types that are objects
export type Context = Ctx<v2.Model>;

// node types that are objects or references
export type ItemsOf<T> = Dictionary<T | JsonReference<T>>;

export async function deserializeOpenAPI2(host: Host, ...inputs: Array<string>) {
  const output = await new Visitor<v2.Model>(new ApiModel(), host, 'oai2', ...inputs).process(processRoot);

  return output;
}

async function processRoot(oai2: v2.Model, $: Context) {

  const extensions = vendorExtensions(oai2);

  for (const [key] of extensions) {
    switch (key) {
      case 'x-ms-metadata':

        break;
      default:
        // record unknown extensions at model level
        break;
    }
  }
  
  $.api.metaData = await singleOrDefault($.process(processInfo, oai2.info)) || $.api.metaData;

  // external docs are just a kind of reference
  for await (const reference of $.process(processExternalDocs, oai2.externalDocs)) {
    $.api.metaData.references.push(reference);
  }

  for await (const reference of $.processArray(processTag, oai2.tags)) {
    $.api.metaData.references.push(reference);
  }

  for await (const server of $.process(processServers, oai2)) {
    $.api.http.connections.push(server);
  }

  for await (const auth of $.processDictionary(authentication, oai2.securityDefinitions)) {
    $.api.http.authentications.push(auth);
  }

  for await (const requirement of $.processArray(authenticationRequirement, oai2.security)) {
    $.api.http.authenticationRequirements.push(requirement);
  }

  // we don't need this.
  use(oai2.swagger);

  return $.api;
}
