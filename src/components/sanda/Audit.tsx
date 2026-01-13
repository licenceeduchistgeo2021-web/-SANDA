"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Download } from 'lucide-react';
import { surveyData, scientificNotes, Axis, Question } from '@/lib/sanda-data';
import { Answers } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import {motion, AnimatePresence} from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type AuditProps = {
  governorate: string;
  onFinishAudit: (answers: Answers) => void;
};

const axisOrder: (keyof typeof surveyData)[] = ['axis1', 'axis2', 'axis3', 'axis4'];

const axisWeights = {
    axis1: { q1: 1.5, q7: 1.5, q8: 1.4, q9: 1.4, default: 1.0 },
    axis2: { q3: 1.4, q5: 1.3, q11: 1.3, default: 1.0 },
    axis3: { q3: 1.5, q8: 1.4, q10: 1.3, default: 1.0 },
    axis4: { q2: 1.5, q10: 1.4, q12: 1.4, default: 1.0 }
};

const scoreInterpretations: { [key: number]: { title: string, description: string } } = {
  1: { title: "مستوى أولي (استجابي)", description: "القدرات محدودة وتعتمد على رد الفعل بعد وقوع الكارثة. لا توجد أنظمة وقائية أو تخطيط استباقي، مما يزيد من الهشاشة." },
  2: { title: "مستوى متفاعل (تطويري)", description: "بداية الوعي بالمخاطر مع وجود بعض القدرات الأساسية غير المكتملة. الجهود لا تزال مجزأة وغير منسجمة بالكامل." },
  3: { title: "مستوى منظم (فعال)", description: "وجود أنظمة وخطط رسمية للحد من المخاطر. القدرات فعالة ومنظمة، وتغطي الجوانب الأساسية للحماية والوقاية." },
  4.5: { title: "مستوى متكامل (مستدام)", description: "نهج شامل ومتكامل يدمج الحد من المخاطر في جميع القطاعات. الأنظمة مستدامة وتعتمد على بيانات دقيقة لضمان الصمود." },
  5: { title: "مستوى استشرافي (مرن)", description: "قدرات ديناميكية عالية تعتمد على الابتكار والتكنولوجيا. النظام قادر على التكيف مع المخاطر الجديدة والمستقبلية بمرونة فائقة." },
};

function getInterpretation(score: number) {
    if (score < 1.5) return scoreInterpretations[1];
    if (score < 2.5) return scoreInterpretations[2];
    if (score < 3.5) return scoreInterpretations[3];
    if (score < 4.5) return scoreInterpretations[4.5];
    return scoreInterpretations[5];
}


function calculateAxisScore(axisId: keyof typeof surveyData, answers: Answers) {
    let totalWeightedScore = 0;
    let totalWeights = 0;
    const weightsForAxis = axisWeights[axisId];
    const axisAnswers = answers[axisId];
    
    if (!axisAnswers) return 0;

    const questions = Object.keys(axisAnswers);
    if(questions.length === 0) return 0;
    
    const numQuestions = surveyData[axisId].questions.length;

    for (let i = 1; i <= numQuestions; i++) {
        let qKey = 'q' + i;
        if(axisAnswers[qKey]) {
            let score = parseInt(axisAnswers[qKey]?.replace('L', '') || '0');
            let weight = (weightsForAxis as any)[qKey] || weightsForAxis.default;

            if (score > 0) {
                totalWeightedScore += score * weight;
                totalWeights += weight;
            }
        }
    }
    return totalWeights > 0 ? parseFloat((totalWeightedScore / totalWeights).toFixed(2)) : 0;
}


export default function Audit({ governorate, onFinishAudit }: AuditProps) {
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    axis1: {},
    axis2: {},
    axis3: {},
    axis4: {},
  });
  const [showMiniAnalysis, setShowMiniAnalysis] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentAxisIndex, showMiniAnalysis]);

  const currentAxisId = axisOrder[currentAxisIndex];
  const currentAxis: Axis = surveyData[currentAxisId];
  const questions: Question[] = currentAxis.questions;

  const totalQuestions = axisOrder.reduce((sum, axisId) => sum + surveyData[axisId].questions.length, 0);
  const answeredQuestions = Object.values(answers).reduce((sum, axisAnswers) => sum + Object.keys(axisAnswers).length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentAxisAnsweredCount = Object.keys(answers[currentAxisId]).length;
  const currentAxisTotalQuestions = questions.length;
  const isCurrentAxisComplete = currentAxisAnsweredCount === currentAxisTotalQuestions;

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
    if (!isCurrentAxisComplete) return;

    if (currentAxisIndex < axisOrder.length - 1) {
      setShowMiniAnalysis(true);
    } else {
      onFinishAudit(answers);
    }
  };

  const handleProceedToNextAxis = () => {
    setShowMiniAnalysis(false);
    setCurrentAxisIndex(currentAxisIndex + 1);
  };
  
  const handleExportAxisPdf = () => {
    // This is a placeholder for the PDF export functionality.
    // In a real application, you would use a library like jsPDF and jsPDF-autotable.
    alert(`تصدير نتائج المحور: ${currentAxis.title}`);
    window.print();
  };

  const handleBack = () => {
    if (currentAxisIndex > 0) {
      setCurrentAxisIndex(currentAxisIndex - 1);
      setShowMiniAnalysis(false);
    }
  };
  
  const findNoteForTerm = (text: string) => {
    return Object.entries(scientificNotes).find(([term]) => text.includes(term));
  };
  
  const axisScore = useMemo(() => calculateAxisScore(currentAxisId, answers), [currentAxisId, answers]);
  const interpretation = useMemo(() => getInterpretation(axisScore), [axisScore]);
  const maturityPercentage = useMemo(() => (axisScore / 5) * 100, [axisScore]);

  const chartData = [
    { name: 'Score', value: maturityPercentage },
    { name: 'Remaining', value: 100 - maturityPercentage },
  ];
  const COLORS = ['hsl(var(--accent))', 'hsl(var(--muted))'];


  if (showMiniAnalysis) {
      return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-2xl shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-primary">تحليل نتائج: {currentAxis.title}</CardTitle>
                        <CardDescription>هذه هي نتيجتك الأولية لهذا المحور.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div className="relative h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={450}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-foreground">{axisScore.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground">مستوى النضج: {maturityPercentage.toFixed(0)}%</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-xl font-semibold">{interpretation.title}</p>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{interpretation.description}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={handleExportAxisPdf} variant="outline">
                           <Download className="ml-2 h-4 w-4" />
                            تصدير تقرير المحور
                        </Button>
                        <Button onClick={handleProceedToNextAxis} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            الانتقال إلى المحور التالي
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="max-w-5xl mx-auto text-center mb-8">
        <p className="text-sm text-muted-foreground">
          رسالة الماستر: هندسة تدبير مخاطر الكوارث الطبيعية بعمالات (عين السبع - الحي المحمدي، سيدي البرنوصي، والمحمدية): من الوقاية إلى إعادة الإعمار وفق مقاربة إطار سنداي.
        </p>
        <p className="font-bold mt-2 text-primary">التقييم الخاص بـ: {governorate}</p>
      </header>
      
      <main className="max-w-5xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-lg border">
      <AnimatePresence mode="wait">
        <motion.div
            key={currentAxisIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
                <currentAxis.icon className="h-6 w-6" />
                {currentAxis.title}
              </h2>
              <span className="text-muted-foreground font-mono">({currentAxisIndex + 1}/{axisOrder.length})</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground mt-1 text-center">تقدم الإجابات: {Math.round(progress)}%</p>
          </div>

          <div className="space-y-8">
            {questions.map((q, index) => {
              const noteEntry = findNoteForTerm(q.text);
              return (
                <div key={q.id} className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-start">
                    <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm ml-3 shrink-0">{index + 1}</span>
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
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4"
                  >
                    {q.options.map(opt => (
                      <div key={opt.score} className="flex items-center space-x-3 space-x-reverse p-3 rounded-md hover:bg-muted/50 transition-colors border">
                        <RadioGroupItem value={`L${opt.score}`} id={`${q.id}-L${opt.score}`} />
                        <Label htmlFor={`${q.id}-L${opt.score}`} className="flex-1 text-base cursor-pointer">
                          {opt.text}
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
            <Button onClick={handleNext} disabled={!isCurrentAxisComplete} className='bg-accent hover:bg-accent/90 text-accent-foreground'>
              {currentAxisIndex === axisOrder.length - 1 ? 'إنهاء وعرض النتائج النهائية' : 'تحليل المحور والانتقال للتالي'}
            </Button>
          </div>
        </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
