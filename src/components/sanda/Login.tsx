"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

type LoginProps = {
    onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [facultyLogoError, setFacultyLogoError] = useState(false);
    const [masterLogoError, setMasterLogoError] = useState(false);


    const handleLogin = () => {
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            if (email === 'mohamed.laranti-etu@etu.univh2c.ma' && password === 'Amine@20262024') {
                toast({
                    title: 'تم تسجيل الدخول بنجاح',
                    description: 'مرحباً بك في أداة التدقيق الرقمي SANDA.',
                });
                onLoginSuccess();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'فشل تسجيل الدخول',
                    description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
                });
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4" dir="rtl">
            <header className="text-center mb-8">
                <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
                    {facultyLogoError ? (
                      <span className="font-bold">LOGO_FLSHM</span>
                    ) : (
                      <img
                        src="/faculty_logo.png"
                        alt="University Logo"
                        className="rounded-full hidden md:block"
                        style={{maxHeight: '75px', width: 'auto'}}
                        onError={() => setFacultyLogoError(true)}
                      />
                    )}
                    <div className='flex flex-col gap-2'>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary">
                            الولوج إلى أداة التدقيق الرقمي SANDA
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground max-w-4xl mx-auto">
                            كلية الآداب والعلوم الإنسانية المحمدية - جامعة الحسن الثاني بالدار البيضاء
                        </p>
                    </div>
                    {masterLogoError ? (
                        <span className="font-bold">LOGO_MASTER</span>
                      ) : (
                        <img
                          src="/master_logo.png"
                          alt="Master's Program Logo"
                          className="rounded-full hidden md:block"
                          style={{maxHeight: '75px', width: 'auto'}}
                          onError={() => setMasterLogoError(true)}
                        />
                      )}
                </div>
            </header>

            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle>تسجيل الدخول</CardTitle>
                    <CardDescription>الرجاء إدخال بيانات الاعتماد الخاصة بك للمتابعة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogin} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                        {isLoading ? 'جاري التحقق...' : (
                            <>
                                <Lock className="ml-2 h-4 w-4" />
                                ولوج
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
            <footer className="mt-8 text-center text-xs text-muted-foreground">
                <p>هذه المنصة مخصصة للاستخدام الأكاديمي فقط في إطار رسالة الماستر.</p>
                <p>&copy; {new Date().getFullYear()} - جميع الحقوق محفوظة.</p>
            </footer>
        </div>
    );
}
