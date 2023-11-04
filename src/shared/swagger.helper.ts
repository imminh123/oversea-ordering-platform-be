import { INestApplication, applyDecorators } from '@nestjs/common';
import {
  ApiQuery,
  DocumentBuilder,
  OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import * as apiSpecConverter from 'api-spec-converter';
import * as fs from 'fs';
import * as config from 'config';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Reflector } from '@nestjs/core';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ROLES_KEY } from '../decorators/authorization.decorator';
import { getHost } from '../modules/config/config.provider';

export async function initializeSwagger(app: INestApplication) {
  const server = app.getHttpAdapter();
  const serviceName = config.get<string>('service.name');
  const serviceDescription = config.get<string>('service.descriptions');
  const apiVersion = config.get<string>('service.apiVersion');
  await injectEndpointPolicyToSwaggerMetadata(app);
  const options = new DocumentBuilder()
    .setTitle(`${serviceName} API spec`)
    .setDescription(
      `${serviceDescription} | [swagger.json](${config.get(
        'service.docsBaseUrl',
      )}/swagger.json) | 
      [swagger-2.0.json](${config.get(
        'service.docsBaseUrl',
      )}/swagger-2.0.json)`,
    )
    .setVersion(apiVersion)
    .addServer(`${config.get('server.swaggerSchema')}://${getHost()}`)
    .addApiKey(null, 'access-token')
    .build();

  const [swagger2, oas3] = await generateSwaggerSpecs(app, options);
  // writeSwaggerJson(`${process.cwd()}`, swagger2, oas3);

  server.get(
    `${config.get('service.docsBaseUrl')}/swagger.json`,
    (req, res) => {
      res.json(oas3);
    },
  );
  server.get(
    `${config.get('service.docsBaseUrl')}/swagger-2.0.json`,
    (req, res) => {
      res.json(swagger2);
    },
  );

  SwaggerModule.setup(config.get('service.docsBaseUrl'), app, oas3, {
    swaggerOptions: {
      displayOperationId: true,
    },
  });

  async function generateSwaggerSpecs(
    app: INestApplication,
    config: Omit<OpenAPIObject, 'paths'>,
  ): Promise<[any, OpenAPIObject]> {
    const oas3: OpenAPIObject = SwaggerModule.createDocument(app, config);
    const swagger2 = await apiSpecConverter
      .convert({
        from: 'openapi_3',
        to: 'swagger_2',
        source: oas3,
      })
      .then((converted) => {
        return converted.spec;
      });
    return [swagger2, oas3];
  }

  function writeSwaggerJson(path: string, swagger2: any, oas3: OpenAPIObject) {
    const swaggerFile = `${path}/swagger.json`;
    const swaggerFile2 = `${path}/swagger-2.0.json`;
    fs.writeFileSync(swaggerFile, JSON.stringify(oas3, null, 2), {
      encoding: 'utf8',
    });
    fs.writeFileSync(swaggerFile2, JSON.stringify(swagger2, null, 2), {
      encoding: 'utf8',
    });
  }
}

export const CommonQueryRequest = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      schema: {
        type: 'integer',
        minimum: 0,
      },
      example: 1,
      description: 'Page number',
      required: false,
    }),
    ApiQuery({
      name: 'perPage',
      schema: {
        type: 'integer',
        minimum: 0,
      },
      example: 20,
      description: 'Limit per page',
      required: false,
    }),
  );
};
interface SwaggerEndpointOperation {
  description: string;
}
export const injectEndpointPolicyToSwaggerMetadata = async (
  app: INestApplication,
) => {
  const discoveryService = app.get(DiscoveryService);
  const reflector = app.get(Reflector);
  const decoratedMethods =
    await discoveryService.methodsAndControllerMethodsWithMetaAtKey<any>(
      ROLES_KEY,
    );

  decoratedMethods.forEach((decoratedMethod) => {
    const endpointOperation: SwaggerEndpointOperation = reflector.get(
      DECORATORS.API_OPERATION,
      decoratedMethod.discoveredMethod?.handler,
    );
    const policy = convertPolicyToText(decoratedMethod.meta);
    Reflect.defineMetadata(
      DECORATORS.API_OPERATION,
      {
        ...endpointOperation,
        description: `${
          endpointOperation.description || ''
        }<hr/>\n\n\n${policy}`,
      },
      decoratedMethod.discoveredMethod?.handler,
    );
  });
};

const convertPolicyToText = (policies): string => {
  let res = `**Endpoint policy**\n\n`;
  res += `Roles: ${policies.join(', ')}<br/>`;
  return res;
};
