import React, { useState } from 'react';

export default function Dashboard() {
    // Mock data for display
    const [stats] = useState([
        { title: 'Total Bankroll', value: '$14,892.50', change: '+5.2%', trend: 'up' },
        { title: 'Monthly P/L', value: '+$2,155.80', change: '+18.1%', trend: 'up' },
        { title: 'ROI (YTD)', value: '24.7%', change: '+2.3%', trend: 'up' },
        { title: 'Active Positions', value: '7', change: '0', trend: 'neutral' },
    ]);

    const recentActivity = [
        { id: 1, time: '5m ago', type: 'Bet Placed', market: 'NFL - Chiefs vs Raiders', details: 'Chiefs -6.5', amount: '$500' },
        { id: 2, time: '12m ago', type: 'Win', market: 'NBA - Lakers vs Warriors', details: 'Over 224.5', amount: '+$450' },
        { id: 3, time: '45m ago', type: 'Alert Trigger', market: 'MLB - Yankees', details: 'Line movement detected (YNY/BOS)', amount: '--' },
        { id: 4, time: '1h ago', type: 'Loss', market: 'Soccer - Premier League', details: 'Arsenal ML', amount: '-$200' },
        { id: 5, time: '2h ago', type: 'Deposit', market: 'Wallet', details: 'Bank Transfer', amount: '+$5,000' },
    ];

    const marketAlerts = [
        { id: 'a1', severity: 'high', message: 'Significant line movement on MNF: BUF vs MIA (+3.5 to +1.5)' },
        { id: 'a2', severity: 'med', message: 'Key player (QB) questionable for Sunday: SF vs SEA' },
        { id: 'a3', severity: 'low', message: 'Total trending up for: LAL vs PHX (218 to 221)' },
    ];

    const StatCard = ({ title, value, change, trend }) => (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex-1 min-w-[200px]">
            <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">{title}</div>
            <div className="text-3xl font-bold text-white mb-1.5">{value}</div>
            <div className={`text-sm font-medium flex items-center gap-1.5 ${trend === 'up' ? 'text-emerald-400' :
                    trend === 'down' ? 'text-rose-400' :
                        'text-slate-400'
                }`}>
                {trend === 'up' && '▲'}
                {trend === 'down' && '▼'}
                {change}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Welcome Back, Operator
                    </h2>
                    <p className="text-slate-400 mt-1">Real-time market intelligence and performance overview.</p>
                </div>
                <button className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow transition-colors">
                    Analyze New Slate
                </button>
            </div>

            {/* Stats Grid */}
            <div className="flex flex-wrap gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Grid: Activity & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Recent Activity Stream</h3>
                        <button className="text-sm text-cyan-400 hover:text-cyan-300">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                <div className={`w-2 h-12 rounded ${activity.type === 'Win' ? 'bg-emerald-500' :
                                        activity.type === 'Loss' ? 'bg-rose-500' :
                                            activity.type === 'Alert Trigger' ? 'bg-amber-500' :
                                                'bg-blue-500'
                                    }`}></div>
                                <div className="flex-grow grid grid-cols-4 gap-4 items-center">
                                    <div className="col-span-2">
                                        <div className="font-semibold text-white">{activity.market}</div>
                                        <div className="text-sm text-slate-400">{activity.details}</div>
                                    </div>
                                    <div className="text-sm text-slate-300">{activity.type}</div>
                                    <div className={`text-right font-medium ${activity.amount.startsWith('+') ? 'text-emerald-400' :
                                            activity.amount.startsWith('-') ? 'text-rose-400' :
                                                'text-white'
                                        }`}>
                                        {activity.amount}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 w-16 text-right">{activity.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Market Alerts Sidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Priority Market Alerts</h3>
                    <div className="space-y-4">
                        {marketAlerts.map((alert) => (
                            <div key={alert.id} className="flex gap-4 p-4 rounded-lg border" style={{
                                backgroundColor: alert.severity === 'high' ? 'rgba(225, 29, 72, 0.1)' :
                                    alert.severity === 'med' ? 'rgba(245, 158, 11, 0.1)' :
                                        'rgba(34, 211, 238, 0.05)',
                                borderColor: alert.severity === 'high' ? 'rgba(225, 29, 72, 0.3)' :
                                    alert.severity === 'med' ? 'rgba(245, 158, 11, 0.3)' :
                                        'rgba(34, 211, 238, 0.2)'
                            }}>
                                <div className={`mt-1 text-xl ${alert.severity === 'high' ? 'text-rose-400' :
                                        alert.severity === 'med' ? 'text-amber-400' :
                                            'text-cyan-400'
                                    }`}>
                                    {alert.severity === 'high' ? '★' : alert.severity === 'med' ? '▲' : '■'}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
                            </div>
                        ))}
                        <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                            <p className="text-sm text-slate-400 mb-3">Configure advanced algorithmic alert triggers.</p>
                            <button className="text-sm px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium">
                                Manage Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Spacer */}
            <div className="h-4"></div>
        </div>
    );
}