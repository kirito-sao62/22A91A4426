const axios = require('axios');

let authToken = null;
const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";


const init = (token) => {
    if (!token) {
        throw new Error("Logging Middleware: Authorization token must be provided during initialization.");
    }
    authToken = token;
};


const Log = async (stack, level, pkg, message) => {
    if (!authToken) {
        //  fail if not initialized
        return;
    }

    try {
        await axios.post(
            LOG_API_URL,
            { stack, level, package: pkg, message },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
       //fail silently.
    }
};

// Export the function
module.exports = {
    init,
    Log
};