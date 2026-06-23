import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DiagnosisDonutChartProps {
  evaluation: any;
}

export default function DiagnosisDonutChart({ evaluation }: DiagnosisDonutChartProps) {
  if (!evaluation || !evaluation.hojas || evaluation.hojas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No hay datos para mostrar.
      </div>
    );
  }

  // Contar cuántas hojas tuvieron cada diagnóstico en esta evaluación
  let countNormal = 0;
  let countLeve = 0;
  let countAlto = 0;

  evaluation.hojas.forEach((h: any) => {
    if (h.clase_predicha === 0) countNormal++;
    else if (h.clase_predicha === 1) countLeve++;
    else countAlto++;
  });

  const data = [
    { name: 'Normal', value: countNormal, color: 'var(--color-success)' },
    { name: 'Riesgo Leve', value: countLeve, color: 'var(--color-warning)' },
    { name: 'Riesgo Alto', value: countAlto, color: 'var(--color-danger)' }
  ].filter(item => item.value > 0); // Ocultar los que tienen 0

  return (
    <div className="w-full h-64 -mt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '6px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number) => [`${value} hojas`, 'Cantidad']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
