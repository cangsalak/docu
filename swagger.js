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
      '/pages': {
        post: {
          summary: 'สร้างหน้าใหม่',
          tags: ['Pages'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'สร้างหน้าสำเร็จ',
            },
          },
        },
        get: {
          summary: 'ดึงรายการหน้าทั้งหมด',
          tags: ['Pages'],
          responses: {
            '200': {
              description: 'รายการหน้าทั้งหมด',
            },
          },
        },
      },
      '/pages/{id}': {
        get: {
          summary: 'ดึงข้อมูลหน้าตาม ID',
          tags: ['Pages'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'ข้อมูลหน้า',
            },
            '404': {
              description: 'ไม่พบหน้า',
            },
          },
        },
        put: {
          summary: 'อัปเดตหน้า',
          tags: ['Pages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'อัปเดตหน้าสำเร็จ',
            },
            '404': {
              description: 'ไม่พบหน้า',
            },
          },
        },
        delete: {
          summary: 'ลบหน้า',
          tags: ['Pages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'ลบหน้าสำเร็จ',
            },
            '404': {
              description: 'ไม่พบหน้า',
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
