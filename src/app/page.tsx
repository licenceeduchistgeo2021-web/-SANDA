"use client";

import { useState, useEffect } from 'react';
import Landing from '@/components/sanda/Landing';
import Audit from '@/components/sanda/Audit';
import Results from '@/components/sanda/Results';
import Comparison from '@/components/sanda/Comparison';
import Login from '@/components/sanda/Login';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export type Answers = {
    axis1: { [key: string]: string };
    axis2: { [key: string]: string };
    axis3: { [key: string]: string };
    axis4: { [key: string]: string };
};

export type Stage = 'login' | 'landing' | 'audit' | 'results' | 'comparison';

export default function Home() {
    const [stage, setStage] = useState<Stage>('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
    const [finalAnswers, setFinalAnswers] = useState<Answers | null>(null);
    
    useEffect(() => {
        try {
            // استخدام localStorage بدلاً من sessionStorage لضمان بقاء الجلسة حتى بعد إغلاق المتصفح
            const authStatus = localStorage.getItem('sanda-auth');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
                setStage('landing');
            }
        } catch (e) {
            console.error("Failed to read auth status from localStorage", e);
        }
    }, []);


    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        try {
            localStorage.setItem('sanda-auth', 'true');
        } catch (e) {
             console.error("Failed to save auth status to localStorage", e);
        }
        setStage('landing');
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
         try {
            localStorage.removeItem('sanda-auth');
        } catch (e) {
             console.error("Failed to remove auth status from localStorage", e);
        }
        setStage('login');
    };

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

    const handleGoToComparison = () => {
        setStage('comparison');
    }

    if (!isAuthenticated || stage === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="bg-background text-foreground relative">
             <div className="absolute top-4 left-4 z-50">
                <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </Button>
            </div>
            {stage === 'landing' && <Landing onStartAudit={handleStartAudit} onGoToComparison={handleGoToComparison} />}
            {stage === 'audit' && <Audit governorate={selectedGovernorate} onFinishAudit={handleFinishAudit} onBackToHome={handleRestart} />}
            {stage === 'results' && finalAnswers && (
                <Results
                    governorate={selectedGovernorate}
                    answers={finalAnswers}
                    onRestart={handleRestart}
                />
            )}
            {stage === 'comparison' && <Comparison onBackToLanding={handleRestart} />}
        </div>
    );
}
