"use client";

import type { Axis } from '@/lib/data';
import type { Answer } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AuditSurveyProps {
  auditData: Axis[];
  answers: Answer;
  onAnswerChange: (questionId: number, score: number) => void;
  onSubmit: () => void;
  answeredQuestions: number;
  totalQuestions: number;
  selectedGovernorate: string;
}

export default function AuditSurvey({
  auditData,
  answers,
  onAnswerChange,
  onSubmit,
  answeredQuestions,
  totalQuestions,
  selectedGovernorate
}: AuditSurveyProps) {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="space-y-6">
       <Card className="print:hidden">
        <CardHeader>
          <CardTitle>استبيان التدقيق - {selectedGovernorate}</CardTitle>
          <div className="flex items-center gap-4 pt-4">
            <Progress value={progressPercentage} className="w-full" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {answeredQuestions} / {totalQuestions}
            </span>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue={auditData[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 print:hidden">
          {auditData.map((axis) => (
            <TabsTrigger key={axis.id} value={axis.id} className="flex gap-2">
              <axis.icon className="h-4 w-4" />
              {axis.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {auditData.map((axis) => (
          <TabsContent key={axis.id} value={axis.id} className="space-y-4">
            <div className="print:block hidden my-4">
              <h2 className="text-2xl font-semibold">{axis.title}</h2>
            </div>
            <div className="space-y-4 print:space-y-2">
              {axis.questions.map((question, index) => (
                <Card key={question.id} className="shadow-sm print:shadow-none print:border-0 print:bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-base font-medium print:text-sm">
                      {index + 1}. {question.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => onAnswerChange(question.id, parseInt(value, 10))}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 print:flex print:justify-around"
                    >
                      {question.options.map((option) => (
                        <div key={option.score} className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value={option.score.toString()} id={`${question.id}-${option.score}`} />
                          <Label htmlFor={`${question.id}-${option.score}`} className="font-normal cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-center mt-8 print:hidden">
        <Button onClick={onSubmit} disabled={answeredQuestions < totalQuestions} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
          عرض النتائج
        </Button>
      </div>
    </div>
  );
}
