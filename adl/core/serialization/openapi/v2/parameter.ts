import { v2 } from '@azure-tools/openapi';
import { FormDataParameter, HeaderParameter, PathParameter, QueryParameter, RenderStyle } from '../../../model/http/parameter';
import { processSchema } from './schema';
import { Context } from './serializer';

export async function* parameter(parameter: v2.Parameter, $: Context, options?: { isAnonymous?: boolean }) {

  switch (parameter.in) {
    case v2.ParameterLocation.Path:
      return yield* processPathParameter(<v2.PathParameter>parameter, $, options);

    case v2.ParameterLocation.Query:
      return yield* processQueryParameter(<v2.QueryParameter>parameter, $, options);
    
    case v2.ParameterLocation.FormData:
      return yield* processFormDataParameter(<v2.FormDataParameter>parameter, $, options);

    case v2.ParameterLocation.Header:
      return yield* processHeaderParameter(<v2.HeaderParameter>parameter, $, options);
  }
  throw $.error(`unknown parameter location '${parameter.in}'`, parameter);

}


export async function* processPathParameter(parameter: v2.PathParameter, $: Context, options?: { isAnonymous?: boolean }) {
  const typeref = await processSchema(<v2.Schema><unknown>parameter, $, { isAnonymous: true });
  const result = new PathParameter(parameter.name, typeref, false, {
    description: parameter.description,
    required: parameter.required,
    renderStyle:  RenderStyle.Simple,
    generatedLocation: parameter['x-ms-parameter-location']
  }); 
  yield result;
}


export async function* processQueryParameter(parameter: v2.QueryParameter, $: Context, options?: { isAnonymous?: boolean }) {
  const typeref = await processSchema(<v2.Schema>parameter, $, {isAnonymous: true});
  const renderStyle =  RenderStyle.Form;
  const result = new QueryParameter(parameter.name, typeref, true, {
    description: parameter.description,
    required: parameter.required,
    renderStyle,
    allowEmptyValue: parameter.allowEmptyValue,
    allowReserved: parameter['x-ms-skip-url-encoding'],
    generatedLocation: parameter['x-ms-parameter-location']
  });
  yield result;
}

export async function* processFormDataParameter(parameter: v2.FormDataParameter, $: Context, options?: { isAnonymous?: boolean }) {
  const typeref = await processSchema(<v2.Schema>parameter, $, { isAnonymous: true });
  const renderStyle = RenderStyle.Form;
  const result = new FormDataParameter(parameter.name, typeref, true, {
    description: parameter.description,
    required: parameter.required,
    renderStyle,
    allowReserved: parameter['x-ms-skip-url-encoding'],
    generatedLocation: parameter['x-ms-parameter-location']
  });
  yield result;
}

export async function* processHeaderParameter(parameter: v2.HeaderParameter, $: Context, options?: { isAnonymous?: boolean }) {
  const typeref = await processSchema(<v2.Schema>parameter, $, { isAnonymous: true });
  const result = new HeaderParameter(parameter.name, typeref, false, {
    description: parameter.description,
    required: parameter.required,
    renderStyle: RenderStyle.Simple,
    generatedLocation: parameter['x-ms-parameter-location']
  });
  
  yield result;
}