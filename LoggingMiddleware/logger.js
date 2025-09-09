const axios = require('axios');


const authConfig = {
  accessCode: "tyshUW",
  clientID: "f99f9c2a-2bb6-43a3-9a7d-4678c2b68c4a",    
  clientSecret: "fByGRDZVhenGxEEn", 
};

let authToken = null;

async function getAuthToken() {
  try {
    const response = await axios.post('http://20.244.56.144/evaluation-service/auth', {
      email: "vamsivardhan.reddy@spsu.ac.in",    
      name: "Gaddam Vamsivardhan Reddy",                  
      rollNo: "22CS002575",              
      accessCode: authConfig.accessCode,
      clientID: authConfig.clientID,
      clientSecret: authConfig.clientSecret
    });
    
    authToken = response.data.access_token;
    console.log("Authenticatioon Sucesful");
    return authToken;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    return null;
  }
}

async function Log(stack, level, package, message) {
  try {
    if (!authToken) {
      await getAuthToken();
    }

    const logData = {
      stack: stack,       
      level: level,         
      package: package,  
      message: message
    };

    await axios.post('http://20.244.56.144/evaluation-service/logs', logData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`[${level.toUpperCase()}] ${package}: ${message}`);
  } catch (error) {
    console.error('Logging failed:', error.response?.data || error.message);
  }
}


function loggingMiddleware(req, res, next) {
  Log("backend", "info", "middleware", `${req.method} ${req.path} - Request received`);
  next();
}

module.exports = { Log, loggingMiddleware, getAuthToken };
