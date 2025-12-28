module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      ok: true,
      service: "HiveCraft API",
      time: new Date().toISOString(),
      env: process.env.ENV_NAME || "dev"
    }
  };
};
