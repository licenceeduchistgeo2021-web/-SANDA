
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Landing from '@/components/sanda/Landing';
import Audit from '@/components/sanda/Audit';
import Results from '@/components/sanda/Results';
import Comparison from '@/components/sanda/Comparison';
import Login from '@/components/sanda/Login';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronRight } from 'lucide-react';

const VulnerabilityMap = dynamic(() => import('@/components/sanda/VulnerabilityMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-slate-100 rounded-lg animate-pulse" />
});

export type Answers = {
    axis1: { [key: string]: string };
    axis2: { [key: string]: string };
    axis3: { [key: string]: string };
    axis4: { [key: string]: string };
};

export type Stage = 'login' | 'landing' | 'audit' | 'results' | 'comparison' | 'maps';

export default function Home() {
    const [stage, setStage] = useState<Stage>('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
    const [finalAnswers, setFinalAnswers] = useState<Answers | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    
    useEffect(() => {
        try {
            const authStatus = localStorage.getItem('sanda-auth');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
                
                // استعادة المرحلة والعمالة إذا كان هناك تدقيق مستمر
                const savedStage = localStorage.getItem('sanda-current-stage') as Stage;
                const savedGov = localStorage.getItem('sanda-current-gov');
                
                if (savedStage === 'audit' && savedGov) {
                    setSelectedGovernorate(savedGov);
                    setStage('audit');
                } else if (savedStage && savedStage !== 'login') {
                    setStage(savedStage);
                } else {
                    setStage('landing');
                }
            }
        } catch (e) {
            console.error("Failed to read auth status from localStorage", e);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // حفظ المرحلة الحالية في localStorage عند تغيرها
    useEffect(() => {
        if (isAuthenticated && stage !== 'login') {
            localStorage.setItem('sanda-current-stage', stage);
            if (stage === 'audit' && selectedGovernorate) {
                localStorage.setItem('sanda-current-gov', selectedGovernorate);
            }
        }
    }, [stage, isAuthenticated, selectedGovernorate]);


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
            localStorage.removeItem('sanda-current-stage');
            localStorage.removeItem('sanda-current-gov');
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
        localStorage.removeItem('sanda-current-gov'); // تنظيف العمالة الحالية بعد الانتهاء
    };
    
    const handleRestart = () => {
        setSelectedGovernorate('');
        setFinalAnswers(null);
        setStage('landing');
        localStorage.removeItem('sanda-current-gov');
    };

    const handleGoToComparison = () => {
        setStage('comparison');
    };

    const handleGoToMaps = () => {
        setStage('maps');
    };

    if (!isInitialized) return null;

    if (!isAuthenticated || stage === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="bg-background text-foreground relative">
             <div className="absolute top-4 left-4 z-50 no-print">
                <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </Button>
            </div>
            {stage === 'landing' && <Landing onStartAudit={handleStartAudit} onGoToComparison={handleGoToComparison} onGoToMaps={handleGoToMaps} />}
            {stage === 'audit' && <Audit governorate={selectedGovernorate} onFinishAudit={handleFinishAudit} onBackToHome={handleRestart} />}
            {stage === 'results' && finalAnswers && (
                <Results
                    governorate={selectedGovernorate}
                    answers={finalAnswers}
                    onRestart={handleRestart}
                />
            )}
            {stage === 'comparison' && <Comparison onBackToLanding={handleRestart} />}
            {stage === 'maps' && (
                <div className="min-h-screen bg-background text-foreground">
                    <div className="container mx-auto px-4 py-8">
                        <Button
                            onClick={handleRestart}
                            variant="outline"
                            className="mb-6"
                        >
                            <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                            العودة إلى الصفحة الرئيسية
                        </Button>
                        <VulnerabilityMap />
                    </div>
                </div>
            )}
        </div>
    );
}
