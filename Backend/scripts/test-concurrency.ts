import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function runTest() {
    console.log('Starting Concurrency Test...');

    try {
        // 1. Create Doctor
        console.log('Creating Doctor...');
        const docRes = await axios.post(`${API_URL}/doctors`, {
            name: 'Dr. Concurrency',
            specialty: 'Testing'
        });
        const doctorId = docRes.data.id;
        console.log('Doctor Created:', doctorId);

        // 2. Create Slot
        console.log('Creating Slot...');
        const time = new Date().toISOString();
        const slotRes = await axios.post(`${API_URL}/slots`, {
            time,
            doctorId
        });
        const slotId = slotRes.data.id;
        console.log('Slot Created:', slotId);

        // 3. Fire 10 concurrent booking requests
        console.log('Firing 10 concurrent booking requests...');
        const requests = [];
        for (let i = 0; i < 10; i++) {
            requests.push(
                axios.post(`${API_URL}/bookings`, {
                    userId: `user-${i}`,
                    slotId
                }).then(res => ({ status: 'fulfilled', value: res.data }))
                    .catch(err => ({ status: 'rejected', reason: err.response?.data || err.message }))
            );
        }

        const results = await Promise.all(requests);

        // 4. Analyze results
        let successCount = 0;
        let failCount = 0;

        results.forEach((r: any, index) => {
            if (r.status === 'fulfilled' && r.value.status === 'CONFIRMED') {
                successCount++;
                console.log(`Req ${index}: CONFIRMED`);
            } else {
                failCount++;
                console.log(`Req ${index}: FAILED (${JSON.stringify(r.reason)})`);
            }
        });

        console.log('--------------------------------');
        console.log(`Total Requests: ${results.length}`);
        console.log(`Successes: ${successCount}`);
        console.log(`Failures: ${failCount}`);

        if (successCount === 1 && failCount === 9) {
            console.log('TEST PASSED: Only 1 booking succeeded.');
        } else {
            console.log('TEST FAILED: Unexpected success/fail ratio.');
        }

    } catch (error) {
        console.error('Test script error:', error);
    }
}

runTest();
