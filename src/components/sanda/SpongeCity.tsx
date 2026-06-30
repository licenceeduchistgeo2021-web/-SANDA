"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const names = ['عين سبا حي محمدي', 'سيدي البرنوصي (صناعي)', 'سيدي البرنوصي (سكني)'];

const initialBaseRows = [
  { area: 12.5, density: 8500, soil: 'طمي', green: 22, period: 'جديد' },
  { area: 8.3, density: 3200, soil: 'رملي', green: 15, period: 'قديم' },
  { area: 6.7, density: 7200, soil: 'طمي', green: 30, period: 'جديد' },
];

const initialPlanningRows = [
  { gamma: 35, omega: 45, theta: 25 },
  { gamma: 18, omega: 25, theta: 12 },
  { gamma: 32, omega: 42, theta: 22 },
];

const soilOptions = ['طيني', 'طمي', 'رملي'] as const;
const periodOptions = ['قديم', 'جديد'] as const;

type BaseRow = typeof initialBaseRows[number];
type PlanningRow = typeof initialPlanningRows[number];

export default function SpongeCity() {
  const [baseRows, setBaseRows] = useState<BaseRow[]>(initialBaseRows);
  const [planningRows, setPlanningRows] = useState<PlanningRow[]>(initialPlanningRows);
  const [storageDepth, setStorageDepth] = useState(100);
  const [alphaVal, setAlphaVal] = useState(0.5);
  const [phi0Val, setPhi0Val] = useState(0.32);
  const [phi1Val, setPhi1Val] = useState(0.85);
  const [summaryText, setSummaryText] = useState('⏳ انتظر... اضغط على "احسب المؤشرات" لعرض الملخص.');
  const [computedVcrar, setComputedVcrar] = useState<number[]>([0, 0, 0]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const chartVCRARRef = useRef<HTMLCanvasElement | null>(null);
  const chartIndicatorsRef = useRef<HTMLCanvasElement | null>(null);
  const chartVCRARInstance = useRef<Chart | null>(null);
  const chartIndicatorsInstance = useRef<Chart | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainerRef.current) return;
      const leaflet = await import('leaflet');
      const L = leaflet.default || leaflet;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current).setView([33.68, -7.38], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      const markers = [
        { lat: 33.695, lng: -7.385, name: 'عين سبا حي محمدي' },
        { lat: 33.675, lng: -7.370, name: 'سيدي البرنوصي (صناعي)' },
        { lat: 33.665, lng: -7.390, name: 'سيدي البرنوصي (سكني)' },
      ];

      markers.forEach((marker) => {
        L.marker([marker.lat, marker.lng])
          .addTo(map)
          .bindPopup(`<strong>${marker.name}</strong><br>📍 أضف بياناتك هنا.`);
      });

      L.rectangle([[33.65, -7.40], [33.72, -7.35]], {
        color: '#2e7d32',
        weight: 2,
        dashArray: '5, 5',
        fill: false,
        opacity: 0.6,
      })
        .addTo(map)
        .bindPopup('🟢 منطقة الدراسة (عمالة المحمدية)');

      mapInstanceRef.current = map;
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    calculateAll();
  }, []);

  const updateChartData = (results: Array<{ name: string; gamma: number; omega: number; theta: number; vcrar: number; H: number; period: string; soil: string; greenNow: number; }>) => {
    if (!chartVCRARRef.current || !chartIndicatorsRef.current) return;

    const namesArr = results.map((d) => d.name);
    const vcrarValues = results.map((d) => d.vcrar);
    const gammaValues = results.map((d) => d.gamma);
    const omegaValues = results.map((d) => d.omega);
    const thetaValues = results.map((d) => d.theta);

    const ctx1 = chartVCRARRef.current.getContext('2d');
    const ctx2 = chartIndicatorsRef.current.getContext('2d');
    if (!ctx1 || !ctx2) return;

    if (chartVCRARInstance.current) {
      chartVCRARInstance.current.destroy();
    }
    chartVCRARInstance.current = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: namesArr,
        datasets: [
          {
            label: 'VCRAR (%)',
            data: vcrarValues,
            backgroundColor: ['#2e7d32', '#4caf50', '#81c784'],
            borderColor: ['#1f5a1f', '#2e7d32', '#388e3c'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.parsed.y}%`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, max: 100, title: { display: true, text: 'النسبة المئوية (%)' } },
        },
      },
    });

    if (chartIndicatorsInstance.current) {
      chartIndicatorsInstance.current.destroy();
    }
    chartIndicatorsInstance.current = new Chart(ctx2, {
      type: 'radar',
      data: {
        labels: ['γ (خضرة)', 'ω (نفاذية)', 'θ (غمر)'],
        datasets: namesArr.map((name, index) => ({
          label: name,
          data: [gammaValues[index], omegaValues[index], thetaValues[index]],
          backgroundColor: ['rgba(46,125,50,0.15)', 'rgba(76,175,80,0.15)', 'rgba(129,199,132,0.15)'][index] || 'rgba(46,125,50,0.15)',
          borderColor: ['#2e7d32', '#4caf50', '#81c784'][index] || '#2e7d32',
          pointBackgroundColor: ['#2e7d32', '#4caf50', '#81c784'][index] || '#2e7d32',
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
        },
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  };

  const convertHtoVCRAR = (H: number) => {
    const points = [
      { h: 14.6, v: 60 },
      { h: 19.8, v: 70 },
      { h: 23.1, v: 75 },
      { h: 27.5, v: 80 },
      { h: 33.1, v: 85 },
      { h: 41.5, v: 90 },
    ];
    if (H <= points[0].h) return points[0].v;
    if (H >= points[points.length - 1].h) {
      return 90 + (H - points[points.length - 1].h) * 0.3;
    }
    for (let i = 0; i < points.length - 1; i += 1) {
      if (H >= points[i].h && H < points[i + 1].h) {
        const slope = (points[i + 1].v - points[i].v) / (points[i + 1].h - points[i].h);
        return points[i].v + slope * (H - points[i].h);
      }
    }
    return 60;
  };

  const calculateAll = () => {
    const results: Array<{ name: string; gamma: number; omega: number; theta: number; vcrar: number; H: number; period: string; soil: string; greenNow: number; }> = [];
    let summary = '===== ملخص نتائج المدينة الإسفنجية =====\n';
    summary += `التاريخ: ${new Date().toLocaleDateString()}\n\n`;

    const nextVcrar: number[] = [];

    for (let i = 0; i < names.length; i += 1) {
      const row = baseRows[i];
      const planning = planningRows[i];
      const gammaDecimal = row.green / 100;
      const periodFactor = row.period === 'جديد' ? 1.2 : 0.9;
      const soilFactor = row.soil === 'رملي' ? 1.1 : row.soil === 'طمي' ? 1.0 : 0.85;
      let H = (storageDepth * gammaDecimal * alphaVal) / ((phi1Val - phi0Val) * (1 - gammaDecimal + 0.001));
      if (H < 0) H = 0;
      if (H > 80) H = 80;
      let vcrar = convertHtoVCRAR(H);
      vcrar *= periodFactor * soilFactor;
      if (vcrar > 98) vcrar = 98;
      if (vcrar < 40) vcrar = 40;

      summary += `--- ${names[i]} ---\n`;
      summary += `  نسبة الخضرة الحالية: ${row.green}%\n`;
      summary += `  فترة التطوير: ${row.period}\n`;
      summary += `  نوع التربة: ${row.soil}\n`;
      summary += `  نسبة الخضرة المقترحة (γ): ${planning.gamma}%\n`;
      summary += `  نسبة الأرصفة النفاذة (ω): ${planning.omega}%\n`;
      summary += `  نسبة الخضرة القابلة للغمر (θ): ${planning.theta}%\n`;
      summary += `  VCRAR: ${vcrar.toFixed(1)}%\n`;
      summary += `  عمق التصميم (H): ${H.toFixed(1)} مم\n\n`;

      results.push({
        name: names[i],
        gamma: planning.gamma,
        omega: planning.omega,
        theta: planning.theta,
        vcrar,
        H,
        period: row.period,
        soil: row.soil,
        greenNow: row.green,
      });
      nextVcrar.push(vcrar);
    }

    const summaryHtml = `
      <div style="background:#eaf5ea; padding:20px; border-radius:16px;">
        <h3>📌 ملخص النتائج</h3>
        <pre style="font-size:0.95rem; white-space:pre-wrap; direction:ltr; text-align:right; background:#f5faf5; padding:15px; border-radius:12px;">${summary}</pre>
        <p style="margin-top:10px; color:#1a5a1a;">
          ⚙️ المعاملات المستخدمة: Δh̄ = ${storageDepth} مم | α = ${alphaVal} | φ₀ = ${phi0Val} | φ₁ = ${phi1Val}
        </p>
        <p style="font-size:0.85rem; color:#3d6b3d;">
          🟢 النتائج تقديرية وتعتمد على البيانات المدخلة. يوصى بمراجعتها مع خبراء محليين.
        </p>
      </div>
    `;

    setSummaryText(summaryHtml);
    setComputedVcrar(nextVcrar);
    updateChartData(results);
  };

  const exportResults = () => {
    let text = '===== تقرير المدينة الإسفنجية – عمالة المحمدية =====\n';
    text += `التاريخ: ${new Date().toLocaleDateString()}\n`;
    text += '==========================================\n\n';

    for (let i = 0; i < names.length; i += 1) {
      const planning = planningRows[i];
      const vcrar = computedVcrar[i]?.toFixed(1) || '--';
      text += `--- ${names[i]} ---\n`;
      text += `نسبة الخضرة (γ): ${planning.gamma}%\n`;
      text += `نسبة الأرصفة النفاذة (ω): ${planning.omega}%\n`;
      text += `نسبة الخضرة القابلة للغمر (θ): ${planning.theta}%\n`;
      text += `VCRAR: ${vcrar}%\n\n`;
    }

    text += '--- المعاملات المستخدمة ---\n';
    text += `عمق التخزين (Δh̄): ${storageDepth} مم\n`;
    text += `معامل α: ${alphaVal}\n`;
    text += `معامل φ₀: ${phi0Val}\n`;
    text += `معامل φ₁: ${phi1Val}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_المدينة_الإسفنجية_المحمدية.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleBaseRowChange = (index: number, key: keyof BaseRow, value: string | number) => {
    setBaseRows((prev) => prev.map((row, rowIndex) => (
      rowIndex !== index ? row : { ...row, [key]: value }
    )));
  };

  const handlePlanningRowChange = (index: number, key: keyof PlanningRow, value: number) => {
    setPlanningRows((prev) => prev.map((row, rowIndex) => (
      rowIndex !== index ? row : { ...row, [key]: value }
    )));
  };

  return (
    <div className="page-root">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <h1>🌱 المدينة الإسفنجية</h1>
            <div className="subtitle">
              <strong>رسالة ماستر في التخطيط العمراني المستدام</strong> – تطبيق منهجية VCRAR على 
              <strong>عمالة المحمدية – عمالات مقاطعات عين سبا حي محمدي – سيدي البرنوصي</strong>
            </div>
          </div>
          <Link href="/" className="btn btn-outline" style={{ alignSelf: 'center', marginBottom: '8px' }}>
            العودة إلى المنصة الرئيسية
          </Link>
        </div>

        <section className="card card-academic">
          <h2>📘 1. تعريف المدينة الإسفنجية</h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
            <strong>المدينة الإسفنجية (Sponge City)</strong> هي نموذج لتخطيط المدن يهدف إلى 
            <strong>محاكاة الدورة الهيدرولوجية الطبيعية</strong> قبل التوسع العمراني، من خلال 
            استخدام <strong>البنية التحتية الخضراء</strong> (المتنزهات، الأسطح الخضراء، الأراضي الرطبة، 
            المساحات القابلة للغمر، الأرصفة النفاذة) لـ <strong>التقاط، تخزين، ترشيح، وإعادة استخدام 
            مياه الأمطار</strong>، بدلاً من تصريفها بسرعة عبر الشبكات التقليدية.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
            {[
              { icon: '🌊', label: 'الحد من الفيضانات' },
              { icon: '💧', label: 'تغذية الخزانات الجوفية' },
              { icon: '🌿', label: 'تحسين جودة المياه' },
              { icon: '🏙️', label: 'بيئة حضرية مستدامة' },
            ].map((item) => (
              <div key={item.label} style={{ flex: 1, minWidth: 150, background: '#eaf5ea', padding: 15, borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>{item.icon}</span><br />
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 15, fontSize: '0.95rem', color: '#3d6b3d' }}>
            📚 <em>المفهوم مستوحى من تجارب Low Impact Development (LID) في الولايات المتحدة 
            و Water Sensitive Urban Design (WSUD) في أستراليا.</em>
          </p>
        </section>

        <section className="card card-academic">
          <h2>⚙️ 2. المنهجية العلمية المعتمدة</h2>
          <p>تعتمد الدراسة على <strong>نموذجين رياضيين</strong> أساسيين:</p>
          <ol style={{ margin: '15px 25px', lineHeight: 2 }}>
            <li><strong>نموذج حساب VCRAR</strong> – من منظور قدرة الموقع على احتجاز الأمطار.</li>
            <li><strong>نموذج تحويل VCRAR</strong> إلى مؤشرات تخطيط عمراني (γ, ω, θ).</li>
          </ol>

          <h3>2.1. معادلة عمق مطر التصميم (H)</h3>
          <div className="formula-box">H = (Δh̄ × γ × α) / ((φ₁ – φ₀) × (1 – γ))</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.95rem' }}>
            <span><strong>H</strong> : عمق مطر التصميم (مم)</span>
            <span><strong>Δh̄</strong> : عمق التخزين الموصى به (مم)</span>
            <span><strong>γ</strong> : نسبة المساحات الخضراء (%)</span>
            <span><strong>α</strong> : معامل الفعالية الحجمية (0.5 للخنادق الحيوية)</span>
            <span><strong>φ₀</strong> : معامل الجريان قبل التطوير</span>
            <span><strong>φ₁</strong> : معامل الجريان للأسطح غير النفاذة</span>
          </div>

          <h3 style={{ marginTop: 25 }}>2.2. معادلة معامل الجريان الشامل (φ)</h3>
          <div className="formula-box" style={{ direction: 'ltr' }}>
            φ = [φ<sub>G</sub>×γ×A + φ<sub>P</sub>×ω×(1-γ)×A + φ<sub>H</sub>×(1-ω)×(1-γ)×A] / A<sub>city</sub>
          </div>

          <h3 style={{ marginTop: 25 }}>2.3. معادلة سعة التخزين (V<sub>s</sub>)</h3>
          <div className="formula-box" style={{ direction: 'ltr' }}>
            V<sub>s</sub><sup>Total</sup> = (1/1000) × Σ (θ<sub>j</sub> × γ<sub>j</sub> × A<sub>j</sub> × Δh̄)
          </div>
          <ul style={{ margin: '10px 25px' }}>
            <li><strong>γ</strong> : نسبة المساحات الخضراء</li>
            <li><strong>ω</strong> : نسبة الأرصفة النفاذة</li>
            <li><strong>θ</strong> : نسبة المساحات الخضراء القابلة للغمر</li>
          </ul>
        </section>

        <section className="card">
          <h2>🗺️ 3. خريطة منطقة الدراسة</h2>
          <p>🟢 <strong>خريطة تفاعلية</strong> – يمكنك التنقل والتكبير، وإضافة نقاط اهتمام.</p>
          <div id="map" ref={mapContainerRef} style={{ height: 450, borderRadius: 16, border: '3px solid #cde0cd', margin: '15px 0' }} />
          <p style={{ fontSize: '0.85rem', color: '#3d6b3d', marginTop: 8 }}>
            ✏️ <strong>حق فارغ:</strong> يمكنك إضافة طبقات (Layers) للتربة، شبكات الصرف، أو توزيع المساحات الخضراء.
          </p>
        </section>

        <section className="card">
          <h2>📊 4. البيانات الأساسية للمقاطعات (جدول صماء)</h2>
          <p>🟢 <strong>جدول قابل للتعبئة</strong> – أدخل بياناتك المحلية (المساحة، الكثافة، نوع التربة، نسبة الخضرة الحالية).</p>
          <table className="table-empty">
            <thead>
              <tr>
                <th>المقاطعة</th>
                <th>المساحة (كم²)</th>
                <th>الكثافة (ن/كم²)</th>
                <th>نوع التربة</th>
                <th>نسبة الخضرة الحالية (%)</th>
                <th>فترة التطوير</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name, index) => (
                <tr key={name}>
                  <td><strong>{name}</strong></td>
                  <td><input type="number" value={baseRows[index].area} step="0.1" onChange={(event) => handleBaseRowChange(index, 'area', parseFloat(event.target.value) || 0)} /></td>
                  <td><input type="number" value={baseRows[index].density} step="100" onChange={(event) => handleBaseRowChange(index, 'density', parseFloat(event.target.value) || 0)} /></td>
                  <td>
                    <select value={baseRows[index].soil} onChange={(event) => handleBaseRowChange(index, 'soil', event.target.value)}>
                      {soilOptions.map((soil) => <option key={soil} value={soil}>{soil}</option>)}
                    </select>
                  </td>
                  <td><input type="number" value={baseRows[index].green} min={5} max={80} step={1} onChange={(event) => handleBaseRowChange(index, 'green', parseFloat(event.target.value) || 0)} /></td>
                  <td>
                    <select value={baseRows[index].period} onChange={(event) => handleBaseRowChange(index, 'period', event.target.value)}>
                      {periodOptions.map((period) => <option key={period} value={period}>{period}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>⚙️ 5. معاملات التصميم</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <label>عمق التخزين (Δh̄) مم</label><br />
              <input type="number" value={storageDepth} step="5" min="30" max="250" onChange={(e) => setStorageDepth(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label>معامل α</label><br />
              <input type="number" value={alphaVal} step="0.05" min="0.3" max="0.8" onChange={(e) => setAlphaVal(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label>معامل φ₀</label><br />
              <input type="number" value={phi0Val} step="0.01" min="0.1" max="0.5" onChange={(e) => setPhi0Val(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label>معامل φ₁</label><br />
              <input type="number" value={phi1Val} step="0.01" min="0.6" max="0.95" onChange={(e) => setPhi1Val(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>📋 6. مؤشرات التخطيط المقترحة (جدول صماء)</h2>
          <p>🟢 <strong>حقوق فارغة</strong> – أدخل النسب المئوية المقترحة لكل مؤشر، وسيُحسب الـ VCRAR تلقائياً.</p>
          <table className="table-empty">
            <thead>
              <tr>
                <th>المقاطعة</th>
                <th>نسبة الخضرة (γ) %</th>
                <th>نسبة الأرصفة النفاذة (ω) %</th>
                <th>نسبة الخضرة القابلة للغمر (θ) %</th>
                <th>VCRAR المحسوب (%)</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name, index) => (
                <tr key={name}>
                  <td><strong>{name}</strong></td>
                  <td><input type="number" value={planningRows[index].gamma} min={5} max={90} step={1} onChange={(e) => handlePlanningRowChange(index, 'gamma', parseFloat(e.target.value) || 0)} /></td>
                  <td><input type="number" value={planningRows[index].omega} min={5} max={90} step={1} onChange={(e) => handlePlanningRowChange(index, 'omega', parseFloat(e.target.value) || 0)} /></td>
                  <td><input type="number" value={planningRows[index].theta} min={5} max={80} step={1} onChange={(e) => handlePlanningRowChange(index, 'theta', parseFloat(e.target.value) || 0)} /></td>
                  <td><span style={{ fontWeight: 'bold', color: '#1a6a1a' }}>{computedVcrar[index] ? computedVcrar[index].toFixed(1) : '--'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 15 }}>
            <button className="btn" type="button" onClick={calculateAll}>🔄 احسب المؤشرات</button>
            <button className="btn btn-secondary" type="button" onClick={exportResults}>📥 تصدير النتائج (نصي)</button>
          </div>
        </section>

        <section className="card">
          <h2>📈 7. الرسوم البيانية للنتائج</h2>
          <div className="charts-row">
            <div className="chart-box">
              <h4>مقارنة VCRAR حسب المقاطعة</h4>
              <div className="chart-container">
                <canvas ref={chartVCRARRef} id="chartVCRAR" />
              </div>
            </div>
            <div className="chart-box">
              <h4>نسب المؤشرات (γ, ω, θ)</h4>
              <div className="chart-container">
                <canvas ref={chartIndicatorsRef} id="chartIndicators" />
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#3d6b3d', textAlign: 'center' }}>
            ✏️ <strong>حق فارغ:</strong> يمكنك إضافة رسوم بيانية إضافية (مثل توزيع الأمطار، أو تكلفة التنفيذ).
          </p>
        </section>

        <section className="card" id="summaryBox">
          <h2>📄 8. ملخص النتائج</h2>
          <div dangerouslySetInnerHTML={{ __html: summaryText }} />
        </section>

        <section className="card">
          <h2>📝 9. ملاحظات وبيانات إضافية (حق فارغ)</h2>
          <textarea rows={4} style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #bddbbd', fontSize: '1rem', background: '#fafffa' }} placeholder="أضف هنا: ملاحظات عن التربة، منسوب المياه الجوفية، تحديات التنفيذ، مقترحات تحسين، مراجع إضافية..." />
        </section>

        <div className="footer">
          <p>
            🌿 <strong>رسالة ماستر في التخطيط العمراني المستدام</strong> – تطبيق منهجية المدينة الإسفنجية 
            على عمالة المحمدية (عمالات مقاطعات عين سبا حي محمدي – سيدي البرنوصي)
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            📅 يونيو 2026 | 🏛️ إشراف: د. [الاسم] | 🎓 جامعة [الاسم]
          </p>
          <p style={{ fontSize: '0.8rem', color: '#5a7a5a' }}>
            يعتمد هذا التطبيق على الدراسة العلمية: <em>"Integrating Sponge City Requirements into the Management of Urban Development Land"</em>
          </p>
        </div>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background: #eef7ee; direction: rtl; }
        .page-root { background: #eef7ee; padding: 20px; min-height: 100vh; }
        .container { max-width: 1400px; margin: auto; background: white; padding: 30px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,60,0,0.08); }
        h1 { color: #0a4a0a; border-right: 6px solid #2e8b57; padding-right: 18px; margin-bottom: 10px; font-size: 2.4rem; }
        .subtitle { color: #3d6b3d; font-size: 1.1rem; margin-bottom: 30px; padding-right: 24px; }
        h2 { color: #1a6a1a; margin-top: 40px; border-bottom: 3px solid #a0c8a0; padding-bottom: 12px; font-size: 1.8rem; }
        h3 { color: #2a7a2a; margin-top: 25px; margin-bottom: 10px; font-size: 1.3rem; }
        h4 { color: #1a5a1a; margin-top: 15px; }
        .card { background: #fafffa; border-radius: 16px; padding: 22px; margin: 15px 0; border: 1px solid #cde0cd; box-shadow: 0 2px 12px rgba(0,50,0,0.04); }
        .card-academic { background: #f5fcf5; border-right: 6px solid #2e8b57; }
        table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 0.95rem; }
        th { background: #2e7d32; color: white; padding: 12px; border: 1px solid #1f5a1f; }
        td { padding: 10px; border: 1px solid #bddbbd; text-align: center; background: #f9fdf9; }
        tr:nth-child(even) td { background: #f0f8f0; }
        .table-empty td { background: #fcfdfc; }
        .table-empty input, .table-empty select { width: 100%; max-width: 160px; padding: 6px 10px; border-radius: 20px; border: 2px solid #8cc08c; background: white; font-size: 0.9rem; }
        .table-empty input:focus, .table-empty select:focus { border-color: #2e7d32; outline: none; }
        .chart-container { position: relative; height: 300px; max-width: 600px; margin: 20px auto; }
        .charts-row { display: flex; flex-wrap: wrap; gap: 25px; justify-content: center; }
        .charts-row .chart-box { flex: 1; min-width: 300px; }
        .input-group { display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin: 12px 0; }
        .input-group label { font-weight: bold; color: #1a5a1a; min-width: 140px; }
        .input-group input { padding: 8px 16px; border-radius: 30px; border: 2px solid #8cc08c; width: 180px; font-size: 0.95rem; background: white; }
        .input-group input:focus { border-color: #2e7d32; outline: none; }
        .btn { background: #1f7a1f; color: white; border: none; padding: 10px 35px; border-radius: 40px; font-size: 1rem; cursor: pointer; font-weight: bold; transition: 0.3s; margin: 5px; }
        .btn:hover { background: #0f5a0f; transform: scale(1.02); }
        .btn-secondary { background: #1a5a8a; }
        .btn-secondary:hover { background: #0f3f6a; }
        .btn-outline { background: transparent; color: #1f7a1f; border: 2px solid #1f7a1f; }
        .btn-outline:hover { background: #1f7a1f; color: white; }
        .empty-placeholder { background: #f5faf5; border: 3px dashed #a0c8a0; padding: 30px; text-align: center; border-radius: 16px; color: #3d6b3d; margin: 15px 0; }
        .empty-placeholder strong { color: #1a6a1a; }
        .formula-box { background: #e3f2e3; padding: 18px 25px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 1.15rem; text-align: center; margin: 15px 0; border: 1px solid #a8d0a8; direction: ltr; }
        .formula-label { font-family: 'Segoe UI', sans-serif; font-weight: bold; color: #1a5a1a; }
        .footer { margin-top: 50px; padding-top: 25px; border-top: 3px solid #cde0cd; text-align: center; color: #3d6b3d; font-size: 0.9rem; }
        @media (max-width: 700px) {
          .container { padding: 15px; }
          h1 { font-size: 1.7rem; }
          .table-empty input { width: 100%; }
        }
      `}</style>
    </div>
  );
}
