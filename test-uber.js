const axios = require('axios');
require('dotenv').config({ path: '/Users/sultankhan/DevOps/B2B/B2B UberEats/.env' });

async function testFetch() {
  try {
    const res = await axios.post('http://localhost:3000/api/uber/auth/token', {
      client_id: process.env.UBER_CLIENT_ID,
      client_secret: process.env.UBER_CLIENT_SECRET,
      scope: 'eats.store'
    });
    console.log("Token Response:", res.data);
    
    const storeRes = await axios.get(`http://localhost:3000/api/uber/stores/${process.env.STORE_ID_1}`);
    console.log("Store Response (after token):", storeRes.status);
    
  } catch (err) {
    if (err.response) {
      console.error("Error Response:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}
testFetch();
