import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API социальной сети',
      version: '1.0.0',
      description: 'REST API приложения социальной сети',
    },
    servers: [{ url: 'http://localhost:5001' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                required: ['field', 'message'],
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        UserDto: {
          type: 'object',
          required: [
            'id',
            'username',
            'email',
            'role',
            'avatar',
            'bio',
            'followersCount',
            'followingCount',
            'createdAt',
          ],
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin', 'superadmin'] },
            avatar: { type: 'string' },
            bio: { type: 'string' },
            followersCount: { type: 'integer' },
            followingCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PublicUserDto: {
          type: 'object',
          required: [
            'id',
            'username',
            'role',
            'avatar',
            'bio',
            'followersCount',
            'followingCount',
            'createdAt',
          ],
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin', 'superadmin'] },
            avatar: { type: 'string' },
            bio: { type: 'string' },
            followersCount: { type: 'integer' },
            followingCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LastMessageDto: {
          type: 'object',
          required: ['id', 'senderId', 'text', 'isRead', 'createdAt', 'updatedAt'],
          properties: {
            id: { type: 'string' },
            senderId: { type: 'string' },
            text: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ConversationDto: {
          type: 'object',
          required: ['id', 'participants', 'lastMessage', 'createdAt', 'updatedAt'],
          properties: {
            id: { type: 'string' },
            participants: {
              type: 'array',
              items: { $ref: '#/components/schemas/PublicUserDto' },
            },
            lastMessage: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/LastMessageDto' }],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateConversationRequest: {
          type: 'object',
          required: ['participantId'],
          properties: {
            participantId: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$',
              example: '65b0f3a2c9d4e5f6a7b8c9d0',
            },
          },
        },
        MessageDto: {
          type: 'object',
          required: ['id', 'conversationId', 'senderId', 'text', 'isRead', 'createdAt'],
          properties: {
            id: { type: 'string' },
            conversationId: { type: 'string' },
            senderId: { type: 'string' },
            text: { type: 'string', maxLength: 2000 },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SendMessageRequest: {
          oneOf: [
            {
              type: 'object',
              required: ['recipientId', 'text'],
              properties: {
                recipientId: { type: 'string', minLength: 1 },
                text: { type: 'string', minLength: 1, maxLength: 2000 },
              },
            },
            {
              type: 'object',
              required: ['conversationId', 'text'],
              properties: {
                conversationId: { type: 'string', minLength: 1 },
                text: { type: 'string', minLength: 1, maxLength: 2000 },
              },
            },
          ],
        },
        AuthResponse: {
          type: 'object',
          required: ['accessToken', 'user'],
          properties: {
            accessToken: { type: 'string' },
            user: { $ref: '#/components/schemas/UserDto' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'confirmPassword'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 15,
              pattern: '^\\S+$',
              example: 'john_doe',
            },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, format: 'password' },
            confirmPassword: { type: 'string', minLength: 1, format: 'password' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 1, format: 'password' },
          },
        },
        VerifyEmailRequest: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            code: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
          },
        },
        ResendCodeRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
          },
        },
        RegisterResponse: {
          type: 'object',
          required: ['email', 'message'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            message: { type: 'string', example: 'Код подтверждения отправлен на почту' },
          },
        },
        MessageResponse: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', example: 'Новый код отправлен' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options) as Record<string, unknown>;
