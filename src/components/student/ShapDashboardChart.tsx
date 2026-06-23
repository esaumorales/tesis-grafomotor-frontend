import { Icon } from '@iconify/react';

interface ShapDashboardChartProps {
  evaluation: any;
}

export default function ShapDashboardChart({ evaluation }: ShapDashboardChartProps) {
  if (!evaluation || !evaluation.hojas || evaluation.hojas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No hay datos para mostrar.
      </div>
    );
  }

  // Promediar los pesos de todas las hojas de la última evaluación
  const hojas = evaluation.hojas;
  const avgPesos: Record<string, number> = {
    vit_small: 0,
    swin_tiny: 0,
    convnext_tiny: 0,
    resnet18: 0
  };

  hojas.forEach((h: any) => {
    const p = h.pesos_indicadores || {};
    avgPesos.vit_small += p.vit_small || 0.25;
    avgPesos.swin_tiny += p.swin_tiny || 0.25;
    avgPesos.convnext_tiny += p.convnext_tiny || 0.25;
    avgPesos.resnet18 += p.resnet18 || 0.25;
  });

  const numHojas = hojas.length;
  const rawShapData = [
    { id: 'vit_small', label: 'Estructura Global', value: avgPesos.vit_small / numHojas },
    { id: 'swin_tiny', label: 'Proporciones y Espacio', value: avgPesos.swin_tiny / numHojas },
    { id: 'convnext_tiny', label: 'Textura y Continuidad', value: avgPesos.convnext_tiny / numHojas },
    { id: 'resnet18', label: 'Trazo Básico', value: avgPesos.resnet18 / numHojas }
  ];

  // Ordenar de mayor a menor
  const shapData = rawShapData.sort((a, b) => b.value - a.value);

  return (
    <div className="w-full h-full flex flex-col justify-center space-y-4 px-2">
      <p className="text-xs text-text-muted mb-2 leading-tight">
        Aspectos visuales con mayor impacto en el diagnóstico (Última Prueba).
      </p>
      
      <div className="space-y-4">
        {shapData.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-text-main">{item.label}</span>
              <span className="text-text-muted font-bold">{(item.value * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-border h-3 rounded-sm overflow-hidden flex">
              <div 
                className="h-full bg-accent transition-all duration-700 ease-out" 
                style={{ width: `${item.value * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
