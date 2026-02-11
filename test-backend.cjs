const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';
let prospectId = '';
let projectId = '';
let subtaskId = '';

async function runTest() {
    try {
        console.log('--- 1. Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        token = loginRes.data.token;
        console.log('Login Success');

        console.log('\n--- 2. Create Prospect (LEAD) ---');
        const pRes = await axios.post(`${API_URL}/prospects`, {
            no_project: `TEST-${Date.now()}`,
            name_project: 'Test Project',
            client_name: 'Test Client',
            contact_name: 'Test Contact',
            status: 'LEAD'
        }, { headers: { Authorization: `Bearer ${token}` } });
        prospectId = pRes.data.no_project;
        console.log(`Created Prospect: ${prospectId} (Status: ${pRes.data.status})`);

        console.log('\n--- 3. Update Prospect to WON ---');
        await axios.put(`${API_URL}/prospects/${prospectId}`, {
            status: 'WON',
            name_project: 'Test Project',
            client_name: 'Test Client',
            contact_name: 'Test Contact'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Updated to WON');

        console.log('\n--- 4. Verify Project Created ---');
        const projectsRes = await axios.get(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const project = projectsRes.data.find(p => p.prospectId === prospectId);
        if (!project) throw new Error('Project not generated!');
        projectId = project.id;
        console.log(`Project Found: ${projectId} (Is Done: ${project.is_done})`);

        console.log('\n--- 5. Add Subtask ---');
        const subRes = await axios.post(`${API_URL}/projects/subtasks`, {
            projectId,
            name: 'Initial Design',
            deadline: new Date().toISOString(),
            description: 'Create initial mockup'
        }, { headers: { Authorization: `Bearer ${token}` } });
        subtaskId = subRes.data.id;
        console.log(`Subtask Created: ${subtaskId}`);

        console.log('\n--- 6. Update Subtask to 100% ---');
        await axios.put(`${API_URL}/projects/subtasks/${subtaskId}`, {
            progress: 100
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Subtask updated to 100%');

        console.log('\n--- 7. Verify Project Done ---');
        const finalProjectRes = await axios.get(`${API_URL}/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Final Project Status: Is Done = ${finalProjectRes.data.is_done}`);
        if (!finalProjectRes.data.is_done) throw new Error('Project should be DONE');

        console.log('\nSUCCESS: Full flow verified.');

    } catch (error) {
        console.error('TEST FAILED:', error.response ? error.response.data : error.message);
    }
}

runTest();
