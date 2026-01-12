"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GovernorateSelectionProps {
  governorates: string[];
  onSelect: (governorate: string) => void;
}

export default function GovernorateSelection({ governorates, onSelect }: GovernorateSelectionProps) {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleStart = () => {
    if (selectedValue) {
      onSelect(selectedValue);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">مرحباً بك في أداة تدقيق SANDA</CardTitle>
          <CardDescription className="text-center pt-2">
            قبل البدء، يرجى تحديد العمالة التي تنتمي إليها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="governorate-select">العمالة</Label>
              <Select dir="rtl" value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger id="governorate-select" className="w-full">
                  <SelectValue placeholder="اختر عمالة..." />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} disabled={!selectedValue} className="w-full" variant="default">
            بدء التدقيق
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
