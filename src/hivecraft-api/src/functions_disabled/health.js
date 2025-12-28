const { app } = require('@azure/functions');

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async (request, context) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        ok: true,
        service: 'HiveCraft API',
        time: new Date().toISOString(),
        env: process.env.ENV_NAME || 'dev',
      },
    };
  },
});
