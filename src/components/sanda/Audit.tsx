"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { surveyData, scientificNotes, Axis, Question } from '@/lib/sanda-data';
import { Answers } from '@/app/page';

type AuditProps = {
  governorate: string;
  onFinishAudit: (answers: Answers) => void;
};

const axisOrder: (keyof typeof surveyData)[] = ['axis1', 'axis2', 'axis3', 'axis4'];

export default function Audit({ governorate, onFinishAudit }: AuditProps) {
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    axis1: {},
    axis2: {},
    axis3: {},
    axis4: {},
  });

  const currentAxisId = axisOrder[currentAxisIndex];
  const currentAxis: Axis = surveyData[currentAxisId];
  const questions: Question[] = currentAxis.questions;

  const totalQuestions = axisOrder.reduce((sum, axisId) => sum + surveyData[axisId].questions.length, 0);
  const answeredQuestions = Object.values(answers).reduce((sum, axisAnswers) => sum + Object.keys(axisAnswers).length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentAxisId]: {
        ...prev[currentAxisId as keyof Answers],
        [questionId]: value,
      }
    }));
  };

  const handleNext = () => {
    if (currentAxisIndex < axisOrder.length - 1) {
      setCurrentAxisIndex(currentAxisIndex + 1);
    } else {
      onFinishAudit(answers);
    }
  };

  const handleBack = () => {
    if (currentAxisIndex > 0) {
      setCurrentAxisIndex(currentAxisIndex - 1);
    }
  };
  
  const findNoteForTerm = (text: string) => {
    return Object.entries(scientificNotes).find(([term]) => text.includes(term));
  };


  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="max-w-5xl mx-auto text-center mb-8">
        <p className="text-sm text-muted-foreground">
          رسالة الماستر: هندسة تدبير مخاطر الكوارث الطبيعية بعمالات (عين السبع - الحي المحمدي، سيدي البرنوصي، والمحمدية): من الوقاية إلى إعادة الإعمار وفق مقاربة إطار سنداي.
        </p>
        <p className="font-bold mt-2 text-primary">التقييم الخاص بـ: {governorate}</p>
      </header>
      
      <main className="max-w-5xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-lg border">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-primary">{currentAxis.title}</h2>
            <span className="text-muted-foreground">({currentAxisIndex + 1} / {axisOrder.length})</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground mt-1 text-center">تقدم الإجابات: {Math.round(progress)}%</p>
        </div>

        <div className="space-y-8">
          {questions.map((q) => {
            const noteEntry = findNoteForTerm(q.text);
            return (
              <div key={q.id} className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm ml-3 shrink-0">{q.id.replace('q', '')}</span>
                  {q.text}
                  {noteEntry && (
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <sup className="inline-flex align-top cursor-help mr-1 text-primary/50">
                             <HelpCircle size={14} />
                           </sup>
                         </TooltipTrigger>
                         <TooltipContent className="max-w-xs text-right" side="top" dir="rtl">
                           <p className="font-bold">{noteEntry[0]}</p>
                           <p>{noteEntry[1]}</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   )}
                </h3>
                <RadioGroup
                  dir="rtl"
                  value={answers[currentAxisId as keyof Answers][q.id]}
                  onValueChange={(value) => handleAnswerChange(q.id, value)}
                  className="space-y-3"
                >
                  {q.options.map(opt => (
                    <div key={opt.score} className="flex items-center space-x-3 space-x-reverse p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={`L${opt.score}`} id={`${q.id}-L${opt.score}`} />
                      <Label htmlFor={`${q.id}-L${opt.score}`} className="flex-1 text-base cursor-pointer">
                        <span className="font-bold text-primary mr-2">[L{opt.score}]</span> {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <Button onClick={handleBack} disabled={currentAxisIndex === 0} variant="outline">
            السابق
          </Button>
          <Button onClick={handleNext} className='bg-accent hover:bg-accent/90 text-accent-foreground'>
            {currentAxisIndex === axisOrder.length - 1 ? 'إنهاء التقييم' : 'التالي'}
          </Button>
        </div>
      </main>
    </div>
  );
}
