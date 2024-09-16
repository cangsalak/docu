import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ระบบจัดการเอกสาร API',
      version: '1.0.0',
      description: 'API สำหรับระบบจัดการเอกสาร',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {
      '/settings': {
        get: {
          summary: 'ดึงการตั้งค่าทั้งหมด',
          tags: ['Settings'],
          responses: {
            '200': {
              description: 'สำเร็จ',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        value: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/settings/{key}': {
        put: {
          summary: 'อัปเดตการตั้งค่า',
          tags: ['Settings'],
          parameters: [
            {
              in: 'path',
              name: 'key',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    value: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'อัปเดตสำเร็จ',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'ไม่พบการตั้งค่า',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
