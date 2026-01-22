import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Watermark Backend API',
      version: '1.0.3',
      description: 'Watermark processing backend server API',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API 키 인증',
        },
        UnifiedTokenAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-unified-token',
          description: '통합 토큰 인증 (헤더 방식)',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '통합 토큰 인증 (Bearer 방식)',
        },
      },
      schemas: {
        UserInfo: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '사용자 고유 ID',
              example: 1,
            },
            userId: {
              type: 'integer',
              nullable: true,
              description: '외부 시스템 사용자 ID',
              example: 123,
            },
            email: {
              type: 'string',
              nullable: true,
              format: 'email',
              description: '사용자 이메일',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              nullable: true,
              description: '사용자 이름',
              example: '홍길동',
            },
            provider: {
              type: 'string',
              nullable: true,
              description: '인증 제공자 (google, kakao 등)',
              example: 'google',
            },
            clinicId: {
              type: 'integer',
              nullable: true,
              description: '클리닉 ID',
              example: 456,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: '생성 일시',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: '수정 일시',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
          required: ['id'],
        },
        UserInfoResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/UserInfo',
            },
          },
          required: ['success', 'data'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: '에러 메시지',
              example: 'User not found or invalid token',
            },
          },
          required: ['success', 'error'],
        },
        SyncAccountRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: '홍길동',
            },
            provider: {
              type: 'string',
              example: 'google',
            },
            userId: {
              type: 'string',
              example: 'uuid-string',
            },
            unifiedToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            clinicId: {
              type: 'integer',
              nullable: true,
              example: 456,
            },
          },
          required: ['email', 'name', 'provider', 'userId', 'unifiedToken'],
        },
        SyncAccountResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            userId: {
              type: 'string',
              example: 'uuid-string',
            },
            message: {
              type: 'string',
              example: '계정 동기화 완료',
            },
          },
          required: ['success', 'userId', 'message'],
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // 경로는 프로젝트 루트 기준
};

export const swaggerSpec = swaggerJsdoc(options);
