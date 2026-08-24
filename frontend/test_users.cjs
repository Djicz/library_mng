const axios = require('axios');

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
            username: 'admin',
            password: '123'
        });
        const token = loginRes.data.token;
        console.log("Logged in");

        const usersRes = await axios.get('http://localhost:8080/api/manager/user/get-all-users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Users:", usersRes.data.map(u => ({ id: u.id, username: u.username, status: u.status })));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
