import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-gray-400">Total Prospects</h3>
                    <p className="text-4xl font-bold text-primary mt-2">12</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-gray-400">Active Projects</h3>
                    <p className="text-4xl font-bold text-secondary mt-2">5</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-gray-400">Revenue</h3>
                    <p className="text-4xl font-bold text-success mt-2">$1.2M</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
