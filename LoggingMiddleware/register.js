const axios = require('axios');

async function register() {
  try {
    const data = {
      email: "vamsivardhan.reddy@spsu.ac.in",       
      name: "Gaddam Vamsivardhan Reddy",                   
      mobileNo: "9032519546",                        
      githubUsername: "vamshi329",         
      rollNo: "22CS002575",                          
      accessCode: "tyshUW"
    };

    const response = await axios.post('http://20.244.56.144/evaluation-service/register', data);
    
    console.log("REGISTRATION SUCCESS!");
    console.log("SAVE THESE CREDENTIALS:");
    console.log("clientID:", response.data.clientID);
    console.log("clientSecret:", response.data.clientSecret);
    console.log("email:", response.data.email);
    console.log("rollNo:", response.data.rollNo);
    
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
  }
}

register();
