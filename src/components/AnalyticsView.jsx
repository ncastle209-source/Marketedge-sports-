import React, { useState, useEffect } from 'react';
import { fetchMatrixSlates } from '../services/api';
import './AnalyticsView.css';

export default function AnalyticsView() {
    const [selectedSport, setSelectedSport] = useState('ALL');
    const [selectedPlayId, setSelectedPlayId] = useState(1);

    // Dual Records State
    const [records, setRecords] = useState({
        heavyHitter: { wins: 42, losses: 14, winRate: '75.0%' },
        officialPlays: { wins: 118, losses: 74, winRate: '61.5%' }
    });

    const [matrixPlays, setMatrixPlays] = useState([
        {
            id: 1,
            matchup: 'Boston Celtics vs. Miami Heat',
            sport: 'NBA',
            officialPick: 'Celtics -2.5',
            ticketPct: '22%',
            handlePct: '58% ($45k)',
            lineMove: '-4.0 ➔ -2.5 (RLM)',
            matrixScore: '4.82',
            tier: 'ELITE VALUE',
            writeup: 'Massive reverse line movement here. Public squares are heavily leaning Miami at a 78% clip, but sharp handle divergence (+36%) is slamming the Celtics. Official Play: Celtics -2.5.'
        },
        {
            id: 2,
            matchup: 'LA Dodgers vs. SF Giants',
            sport: 'MLB',
            officialPick: 'Dodgers ML (+100)',
            ticketPct: '18%',
            handlePct: '45% ($28k)',
            lineMove: '+110 ➔ +100',
            matrixScore: '3.95',
            tier: 'ELITE VALUE',
            writeup: 'Heavy wiseguy action coming in on the underdog here. Cash handle is sitting at 45% despite low ticket count. Official Play: Dodgers ML.'
        }
    ]);

    useEffect(() => {
        async function loadBackendMatrix() {
            const liveData = await fetchMatrixSlates(matrixPlays);
            if (liveData && liveData.length > 0) {
                setMatrixPlays(liveData);
            }
        }
        loadBackendMatrix();
    }, []);

    const filteredPlays = selectedSport === 'ALL'
        ? matrixPlays
        : matrixPlays.filter(p => p.sport === selectedSport);

    const activePlay = matrixPlays.find(p => p.id === selectedPlayId) || matrixPlays[0];

    return (
        <div className="vl-analytics-container">
            {/* Header & Dual Records Display */}
            <div className="vl-analytics-header">
                <div className="title-group">
                    <h2>Vegas Leverage — Official Market Matrix</h2>
                    <span className="sub-title-tag">Sharp Ticket vs. Handle Divergence System</span>
                </div>

                {/* Dual Record Badges */}
                <div className="vl-records-container">
                    <div className="record-badge heavy-hitter">
                        <span className="record-label">HEAVY HITTER RECORD:</span>
                        <span className="record-stats">
                            {records.heavyHitter.wins} - {records.heavyHitter.losses}
                            <span className="rate">({records.heavyHitter.winRate})</span>
                        </span>
                    </div>

                    <div className="record-badge official-plays">
                        <span className="record-label">OFFICIAL PLAYS RECORD:</span>
                        <span className="record-stats">
                            {records.officialPlays.wins} - {records.officialPlays.losses}
                            <span className="rate">({records.officialPlays.winRate})</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Sport Filter Buttons */}
            <div className="vl-sport-filters">
                {['ALL', 'MLB', 'NBA', 'WNBA', 'NFL', 'TENNIS'].map(sport => (
                    <button
                        key={sport}
                        className={`vl-filter-btn ${selectedSport === sport ? 'active' : ''}`}
                        onClick={() => setSelectedSport(sport)}
                    >
                        {sport}
                    </button>
                ))}
            </div>

            {/* Matrix Table */}
            <div className="vl-matrix-table-wrapper">
                <table className="vl-matrix-table">
                    <thead>
                        <tr>
                            <th>Matchup</th>
                            <th>Sport</th>
                            <th>Official Pick</th>
                            <th>Ticket vs Handle</th>
                            <th>Line Movement</th>
                            <th>Matrix Score</th>
                            <th>Tier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlays.map(play => (
                            <tr
                                key={play.id}
                                className={`${play.tier === 'ELITE VALUE' ? 'highlight-row' : ''} ${selectedPlayId === play.id ? 'selected-row' : ''}`}
                                onClick={() => setSelectedPlayId(play.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className="team-col">{play.matchup}</td>
                                <td>{play.sport}</td>
                                <td className="pick-col">{play.officialPick}</td>
                                <td className="divergence-col">{play.handlePct}</td>
                                <td>{play.lineMove}</td>
                                <td className="score-col">{play.matrixScore}</td>
                                <td>
                                    <span className={`status-badge ${play.tier === 'ELITE VALUE' ? 'elite' : 'pass'}`}>
                                        {play.tier}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Analyst Writeup Panel */}
            {activePlay && (
                <div className="vl-writeup-panel">
                    <div className="writeup-title-bar">
                        <span>Analyst Selection & Matrix Ranking Breakdown</span>
                        <span className="writeup-matchup-tag">{activePlay.matchup}</span>
                    </div>
                    <div className="writeup-highlight-pick">
                        Official Selection: <span>{activePlay.officialPick}</span>
                    </div>
                    <p className="writeup-body">
                        {activePlay.writeup}
                    </p>
                </div>
            )}
        </div>
    );
}