const axios = require('axios');

async function testJudge() {
  try {
    const payload = {
      source_code: "print('Hello world!')",
      language_id: 71,
      base64_encoded: false
    };
    const res = await axios.post('http://192.168.0.105:2358/submissions?wait=true', payload);
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data);
    } else {
      console.error(err);
    }
  }
}

testJudge();
