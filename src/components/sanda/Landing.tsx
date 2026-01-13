'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, Map, FileDown } from 'lucide-react';

const governorates = [
  'عمالة سيدي البرنوصي',
  'عمالة المحمدية',
  'عمالة عين السبع - الحي المحمدي',
];

type LandingProps = {
  onStartAudit: (governorate: string) => void;
};

export default function Landing({ onStartAudit }: LandingProps) {
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [facultyLogoError, setFacultyLogoError] = useState(false);
  const [masterLogoError, setMasterLogoError] = useState(false);

  const handleStart = () => {
    if (selectedGovernorate) {
        onStartAudit(selectedGovernorate);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
            
            {facultyLogoError ? (
              <span className="font-bold">LOGO_FLSHM</span>
            ) : (
              <img
                src="/faculty_logo.png"
                alt="University Logo"
                width={100}
                height={100}
                className="rounded-full hidden md:block"
                style={{maxHeight: '75px', width: 'auto'}}
                data-ai-hint="university logo"
                onError={() => setFacultyLogoError(true)}
              />
            )}

            <div className='flex flex-col gap-2'>
              <h1 className="text-3xl md:text-5xl font-bold text-primary">
                أداة التدقيق الرقمي SANDA
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground max-w-4xl mx-auto">
                رسالة الماستر: هندسة تدبير مخاطر الكوارث الطبيعية بعمالات (عين السبع
                - الحي المحمدي، سيدي البرنوصي، والمحمدية): من الوقاية إلى إعادة
                الإعمار وفق مقاربة إطار سنداي - كلية الآداب والعلوم الإنسانية
                المحمدية - جامعة الحسن الثاني.
              </p>
            </div>
            
            {masterLogoError ? (
                <span className="font-bold">LOGO_MASTER</span>
              ) : (
                <img
                  src="/master_logo.png"
                  alt="Master's Program Logo"
                  width={100}
                  height={100}
                  className="rounded-full hidden md:block"
                  style={{maxHeight: '75px', width: 'auto'}}
                  data-ai-hint="program logo"
                  onError={() => setMasterLogoError(true)}
                />
              )}

          </div>
        </header>

        <section className="max-w-2xl mx-auto bg-card p-8 rounded-xl shadow-lg border mb-16">
          <h2 className="text-xl font-semibold text-center mb-2">
            ابدأ التقييم
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            قبل البدء، يرجى تحديد العمالة التي تنتمي إليها
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select
              dir="rtl"
              value={selectedGovernorate}
              onValueChange={setSelectedGovernorate}
            >
              <SelectTrigger className="w-full text-base h-12">
                <SelectValue placeholder="اختر عمالة..." />
              </SelectTrigger>
              <SelectContent>
                {governorates.map((gov) => (
                  <SelectItem key={gov} value={gov} className="text-base">
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleStart}
              disabled={!selectedGovernorate}
              className="w-full sm:w-auto h-12 px-8 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              ابدأ التدقيق الجديد
            </Button>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  مقارنة العمالات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  تحليل إحصائي للفوارق في مستويات الصمود.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  الخرائط الهندسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  عرض النطاقات الجغرافية للمخاطر وفق تقنيات GIS.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <FileDown className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  استخراج البيانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  تحميل التقارير النهائية بصيغة PDF و Excel.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
