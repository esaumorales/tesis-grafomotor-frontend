import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarSkillsChartProps {
  evaluation: any;
}

export default function RadarSkillsChart({ evaluation }: RadarSkillsChartProps) {
  if (!evaluation) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No hay datos para mostrar.
      </div>
    );
  }

  const clase = evaluation.clase_predicha; // 0, 1, 2
  const confianza = evaluation.confianza_ia || 80;

  // Calculamos puntajes simulados de habilidades (0-100) basados en el diagnóstico general
  // para darle un feedback explicable a la profesora.
  let precisionVal = 0;
  let continuidadVal = 0;
  let espacioVal = 0;
  let estructuraVal = 0;

  if (clase === 0) {
    precisionVal = Math.round(75 + (confianza * 0.20));
    continuidadVal = Math.round(70 + (confianza * 0.25));
    espacioVal = Math.round(80 + (confianza * 0.15));
    estructuraVal = Math.round(85 + (confianza * 0.10));
  } else if (clase === 1) {
    precisionVal = Math.round(65 - (confianza * 0.20));
    continuidadVal = Math.round(60 - (confianza * 0.15));
    espacioVal = Math.round(70 - (confianza * 0.25));
    estructuraVal = Math.round(75 - (confianza * 0.30));
  } else {
    precisionVal = Math.round(35 - (confianza * 0.15));
    continuidadVal = Math.round(30 - (confianza * 0.10));
    espacioVal = Math.round(40 - (confianza * 0.20));
    estructuraVal = Math.round(45 - (confianza * 0.25));
  }

  // Asegurar límites
  const safe = (v: number) => Math.max(10, Math.min(100, v));

  const data = [
    { skill: 'Precisión del Trazo', score: safe(precisionVal) },
    { skill: 'Continuidad', score: safe(continuidadVal) },
    { skill: 'Uso del Espacio', score: safe(espacioVal) },
    { skill: 'Estructura Global', score: safe(estructuraVal) },
  ];

  const chartColor = clase === 0 ? "var(--color-success)" : clase === 1 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <div className="w-full h-64 -mt-4 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: 'var(--color-text-main)', fontSize: 11, fontWeight: 500 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} 
            tickCount={5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Radar 
            name="Habilidad" 
            dataKey="score" 
            stroke={chartColor} 
            fill={chartColor} 
            fillOpacity={0.4} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
