const axios = require('axios');
axios.interceptors.request.use(request => {
  console.log('Request Payload:', JSON.stringify(request.data));
  return request;
})
