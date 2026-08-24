import React, { useState } from 'react';
import SocialGate from './SocialGate';
import CoinFlipFiasco from './CoinFlipFiasco';
import DegenerateDice from './DegenerateDice';
import RouletteElimination from './RouletteElimination';
import PlinkoFinale from './PlinkoFinale';
import './NeonArcade.css';

export default function DegenerateTournament() {
    // Check if user already unlocked during this session
    const [isUnlocked, setIsUnlocked] = useState(() => {
        return sessionStorage.getItem('vl_tournament_unlocked') === 'true';
    });

    const [currentStage, setCurrentStage] = useState(1);
    const [stageSurvivors, setStageSurvivors] = useState({
        fiascoSurvivors: [],
        diceSurvivors: [],
        rouletteFinalists: []
    });

    const handleUnlock = () => {
        sessionStorage.setItem('vl_tournament_unlocked', 'true');
        setIsUnlocked(true);
    };

    const handleCompleteFiasco = (survivors) => {
        setStageSurvivors(prev => ({ ...prev, fiascoSurvivors: survivors }));
        setCurrentStage(2);
    };

    const handleCompleteDice = (survivors) => {
        setStageSurvivors(prev => ({ ...prev, diceSurvivors: survivors }));
        setCurrentStage(3);
    };

    const handleCompleteRoulette = (finalists) => {
        setStageSurvivors(prev => ({ ...prev, rouletteFinalists: finalists }));
        setCurrentStage(4);
    };

    // If not shared/unlocked yet, show the social gate lock screen
    if (!isUnlocked) {
        return <SocialGate onUnlock={handleUnlock} />;
    }

    return (
        <div className="degenerate-tournament-shell">
            {/* Tournament Stage Progress Bar */}
            <div className="tournament-progress-bar">
                <div className={`prog-step ${currentStage >= 1 ? 'active' : ''}`}>1. Fiasco</div>
                <div className={`prog-step ${currentStage >= 2 ? 'active' : ''}`}>2. Dice</div>
                <div className={`prog-step ${currentStage >= 3 ? 'active' : ''}`}>3. Roulette</div>
                <div className={`prog-step ${currentStage >= 4 ? 'active' : ''}`}>4. Finale</div>
            </div>

            {currentStage === 1 && (
                <CoinFlipFiasco onAdvanceToDice={handleCompleteFiasco} />
            )}

            {currentStage === 2 && (
                <DegenerateDice
                    initialSurvivors={stageSurvivors.fiascoSurvivors}
                    onAdvanceToRoulette={handleCompleteDice}
                />
            )}

            {currentStage === 3 && (
                <RouletteElimination
                    survivors={stageSurvivors.diceSurvivors}
                    onAdvanceToPlinko={handleCompleteRoulette}
                />
            )}

            {currentStage === 4 && (
                <PlinkoFinale
                    finalists={stageSurvivors.rouletteFinalists}
                />
            )}
        </div>
    );
}