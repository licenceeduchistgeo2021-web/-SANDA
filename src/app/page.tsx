"use client";

import { useState, useMemo } from 'react';
import { auditData, governorates } from '@/lib/data';
import type { AxisScore, Answer } from '@/lib/data';
import AuditSurvey from '@/components/audit-survey';
import AuditResults from '@/components/audit-results';
import GovernorateSelection from '@/components/governorate-selection';

type Stage = 'selection' | 'survey' | 'results';

export default function Home() {
  const [stage, setStage] = useState<Stage>('selection');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer>({});

  const totalQuestions = useMemo(() => auditData.reduce((acc, axis) => acc + axis.questions.length, 0), []);
  const answeredQuestions = useMemo(() => Object.keys(answers).length, [answers]);

  const handleGovernorateSelect = (governorate: string) => {
    setSelectedGovernorate(governorate);
    setStage('survey');
  };

  const handleAnswerChange = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const calculateScores = (): AxisScore[] => {
    return auditData.map(axis => {
      const axisQuestions = axis.questions;
      const maxScore = axisQuestions.length * 5;
      const score = axisQuestions.reduce((acc, question) => {
        return acc + (answers[question.id] || 0);
      }, 0);
      return { axis: axis.title, score, maxScore };
    });
  };

  const handleShowResults = () => {
    if (answeredQuestions < totalQuestions) {
      // This can be enhanced with a toast notification
      console.error("Please answer all questions.");
      return;
    }
    setStage('results');
  };

  const handleStartOver = () => {
    setStage('selection');
    setSelectedGovernorate(null);
    setAnswers({});
  };

  const renderStage = () => {
    switch (stage) {
      case 'selection':
        return <GovernorateSelection governorates={governorates} onSelect={handleGovernorateSelect} />;
      case 'survey':
        return (
          <AuditSurvey
            auditData={auditData}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleShowResults}
            answeredQuestions={answeredQuestions}
            totalQuestions={totalQuestions}
            selectedGovernorate={selectedGovernorate!}
          />
        );
      case 'results':
        return <AuditResults scores={calculateScores()} onStartOver={handleStartOver} governorate={selectedGovernorate!} />;
      default:
        return <GovernorateSelection governorates={governorates} onSelect={handleGovernorateSelect} />;
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="text-center mb-8 print:hidden">
        <h1 className="text-4xl font-bold text-primary font-headline">أداة تدقيق SANDA</h1>
        <p className="text-muted-foreground mt-2">
          أداة لتقييم النضج في الفهم والحوكمة والاستثمار والاستعداد.
        </p>
      </header>
      <div className="printable-area">
        {renderStage()}
      </div>
    </main>
  );
}
