import React, { useState, useEffect } from 'react';

export default function SteamTracker({ handle = 0, tickets = 0, team = "Pending...", timeFrame = "Last 30 Mins" }) {
    const [animatedHandle, setAnimatedHandle] = useState(0);
    const [animatedTickets, setAnimatedTickets] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedHandle(handle);
            setAnimatedTickets(tickets);
        }, 300);
        return () => clearTimeout(timer);
    }, [handle, tickets]);

    const radius = 70;
    const circumference = Math.PI * radius;

    // Handle (Sharp Money) metrics
    const handleOffset = circumference - (animatedHandle / 100) * circumference;
    const handleAngle = (animatedHandle / 100) * 180 - 90;

    // Ticket (Public Count) metrics
    const ticketOffset = circumference - (animatedTickets / 100) * circumference;
    const ticketAngle = (animatedTickets / 100) * 180 - 90;

    // Divergence calculation (Positive means heavy sharp cash vs public tickets)
    const divergence = handle - tickets;

    return (
        <div style={{ background: '#1c2541', border: '1px solid #3a506b', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#48cae4', margin: '0 0 5px 0', fontSize: '1.1rem' }}>⚡ Sharp vs. Public Steam</h3>
            <p style={{ color: '#8d99ae', fontSize: '0.85rem', margin: '0 0 20px 0' }}>{team} • {timeFrame}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>

                {/* Sharp Handle Gauge */}
                <div style={{ background: '#0b132b', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6fffe9', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>SHARP CASH (HANDLE)</span>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '140px', margin: '0 auto' }}>
                        <svg viewBox="0 0 200 110" style={{ width: '100%', overflow: 'visible' }}>
                            <path d="M 20 100 A 70 70 0 0 1 180 100" fill="none" stroke="#1c2541" strokeWidth="14" strokeLinecap="round" />
                            <path
                                d="M 20 100 A 70 70 0 0 1 180 100"
                                fill="none"
                                stroke="#6fffe9"
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={handleOffset}
                                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                            />
                            <g style={{ transform: `rotate(${handleAngle}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                <polygon points="97,100 103,100 100,30" fill="#ffffff" />
                                <circle cx="100" cy="100" r="7" fill="#ffffff" />
                            </g>
                        </svg>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{animatedHandle}%</div>
                </div>

                {/* Public Tickets Gauge */}
                <div style={{ background: '#0b132b', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ff0055', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>PUBLIC (TICKETS)</span>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '140px', margin: '0 auto' }}>
                        <svg viewBox="0 0 200 110" style={{ width: '100%', overflow: 'visible' }}>
                            <path d="M 20 100 A 70 70 0 0 1 180 100" fill="none" stroke="#1c2541" strokeWidth="14" strokeLinecap="round" />
                            <path
                                d="M 20 100 A 70 70 0 0 1 180 100"
                                fill="none"
                                stroke="#ff0055"
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={ticketOffset}
                                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                            />
                            <g style={{ transform: `rotate(${ticketAngle}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                <polygon points="97,100 103,100 100,30" fill="#ffffff" />
                                <circle cx="100" cy="100" r="7" fill="#ffffff" />
                            </g>
                        </svg>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>{animatedTickets}%</div>
                </div>

            </div>

            {/* Divergence Status Box */}
            <div style={{ background: '#0b132b', padding: '10px', borderRadius: '6px', border: divergence >= 30 ? '1px solid #6fffe9' : '1px solid #3a506b' }}>
                <span style={{ fontSize: '0.8rem', color: '#8d99ae', display: 'block' }}>DIVERGENCE SPREAD</span>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: divergence >= 30 ? '#6fffe9' : '#fff' }}>
                    {divergence > 0 ? `+${divergence}%` : `${divergence}%`} Sharp Money Weight {divergence >= 30 ? '🔥 (SHARP ALIGNMENT)' : ''}
                </span>
            </div>
        </div>
    );
}