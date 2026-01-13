"use client";

import { useState } from 'react';
import Landing from '@/components/sanda/Landing';
import Audit from '@/components/sanda/Audit';
import Results from '@/components/sanda/Results';

export type Answers = {
    axis1: { [key: string]: string };
    axis2: { [key: string]: string };
    axis3: { [key: string]: string };
    axis4: { [key: string]: string };
};

type Stage = 'landing' | 'audit' | 'results';

export default function Home() {
    const [stage, setStage] = useState<Stage>('landing');
    const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
    const [finalAnswers, setFinalAnswers] = useState<Answers | null>(null);

    const handleStartAudit = (governorate: string) => {
        setSelectedGovernorate(governorate);
        setStage('audit');
    };

    const handleFinishAudit = (answers: Answers) => {
        setFinalAnswers(answers);
        setStage('results');
    };
    
    const handleRestart = () => {
        setSelectedGovernorate('');
        setFinalAnswers(null);
        setStage('landing');
    };

    return (
        <div className="bg-background text-foreground">
            {stage === 'landing' && <Landing onStartAudit={handleStartAudit} />}
            {stage === 'audit' && <Audit governorate={selectedGovernorate} onFinishAudit={handleFinishAudit} />}
            {stage === 'results' && finalAnswers && (
                <Results
                    governorate={selectedGovernorate}
                    answers={finalAnswers}
                    onRestart={handleRestart}
                />
            )}
        </div>
    );
}
