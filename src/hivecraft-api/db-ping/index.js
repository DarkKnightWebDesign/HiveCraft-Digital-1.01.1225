const sql = require('mssql');

module.exports = async function (context, req) {
  // Connection string should come from app settings
  // Format: Server=tcp:<server>.database.windows.net,1433;Database=<db>;User ID=<user>;Password=<pass>;Encrypt=true;
  const connectionString = process.env.SQL_CONNECTION_STRING;
  
  if (!connectionString) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        ok: false,
        error: "SQL_CONNECTION_STRING not configured",
        time: new Date().toISOString()
      }
    };
    return;
  }

  try {
    // Create connection pool
    const pool = await sql.connect(connectionString);
    
    // Execute simple query
    const result = await pool.request().query('SELECT 1 AS test');
    
    // Close pool
    await pool.close();
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        ok: true,
        database: "connected",
        testQuery: result.recordset[0].test === 1 ? "passed" : "failed",
        time: new Date().toISOString()
      }
    };
  } catch (err) {
    context.log.error('Database connection error:', err);
    
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        ok: false,
        error: err.message,
        time: new Date().toISOString()
      }
    };
  }
};
