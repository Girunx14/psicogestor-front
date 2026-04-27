import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:8000/citas/', {
      headers: { Authorization: "Bearer TEST" } // just to see 401 or actual shape
    });
    console.log(res.data);
  } catch(e) {
    console.log(e.response?.data);
  }
}
test();
