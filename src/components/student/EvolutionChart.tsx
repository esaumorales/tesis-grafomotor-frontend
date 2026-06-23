import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EvolutionChartProps {
  evaluations?: any[];
}

export default function EvolutionChart({ evaluations = [] }: EvolutionChartProps) {
  // Procesar evaluaciones a datos del gráfico
  const chartData = evaluations.length === 0 ? [] : [...evaluations]
    .sort((a, b) => new Date(a.fecha_evaluacion).getTime() - new Date(b.fecha_evaluacion).getTime())
    .map(ev => {
      // Calculamos un puntaje figurativo basado en la clase predicha y la confianza
      // Clase 0 (Normal) = Alto, Clase 1 (Riesgo Leve) = Medio, Clase 2 (Atención Requerida) = Bajo
      let baseScore = ev.clase_predicha === 0 ? 85 : (ev.clase_predicha === 1 ? 60 : 30);
      let score = baseScore; // simplificado
      
      return {
        name: new Date(ev.fecha_evaluacion).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        score: score
      };
    });

  return (
    <div className="w-full h-64 mt-4 relative">
      {chartData.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-slate-500 text-sm font-medium">
          Aún no hay datos para graficar
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData.length > 0 ? chartData : [{name: 'Sin datos', score: 0}]}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
