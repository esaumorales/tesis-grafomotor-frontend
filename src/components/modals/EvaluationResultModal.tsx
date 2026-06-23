import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import ProgressBar from '../ui/ProgressBar';
import api from '../../services/api';

export default function EvaluationResultModal({ student, evaluation, onClose }: { student: any, evaluation: any, onClose: () => void }) {
  const [selectedHojaIndex, setSelectedHojaIndex] = useState(0);

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const hojas = evaluation.hojas && evaluation.hojas.length > 0
    ? evaluation.hojas
    : [evaluation]; // Retrocompatibilidad: tratar la evaluación antigua como 1 hoja

  const VMI_REFERENCES = [
    { name: 'Línea Vertical', file: '07_linea_vertical.png', icon: 'mdi:minus-vertical' },
    { name: 'Línea Horizontal', file: '08_linea_horizontal.png', icon: 'mdi:minus' },
    { name: 'Círculo', file: '09_circulo.png', icon: 'mdi:circle-outline' },
    { name: 'Cruz', file: '10_cruz_horizontal_vertical.png', icon: 'mdi:plus' },
    { name: 'Línea Inclinada', file: '11_linea_derecha_obliquea.png', icon: 'mdi:slash-forward' },
    { name: 'Cuadrado', file: '12_cuadrado.png', icon: 'mdi:square-outline' },
    { name: 'Línea Inclinada 2', file: '13_linea_derecha_obliquea.png', icon: 'mdi:slash-forward' },
    { name: 'Cruz Inclinada', file: '14_cruz_obliquea.png', icon: 'mdi:close' },
    { name: 'Triángulo', file: '15_triangulo.png', icon: 'mdi:triangle-outline' },
    { name: 'Cuadrado Abierto', file: '16_cuadrado_abierto_circulo.png', icon: 'mdi:shape-outline' },
    { name: '3 Líneas Cruz', file: '17_tres_lineas_cruz.png', icon: 'mdi:asterisk' },
    { name: 'Flechas', file: '18_flechas_direccionales.png', icon: 'mdi:arrow-all' },
    { name: 'Anillos 2D', file: '19_dos_dimensionales_anillos.png', icon: 'mdi:infinity' },
    { name: 'Círculos y Triángulo', file: '20_seis_circulos_triangulo.png', icon: 'mdi:triangle-outline' },
    { name: 'Círculo y Cuadrado', file: '21_circulo_cuadrado_inclinado.png', icon: 'mdi:circle-outline' },
    { name: 'Diamante Vert.', file: '22_diamante_vertical.png', icon: 'mdi:cards-diamond-outline' },
    { name: 'Triángulo Inc.', file: '23_triangulo_inclinado.png', icon: 'mdi:triangle-outline' },
    { name: '8 Puntos', file: '24_ocho_puntos_circulos.png', icon: 'mdi:dots-grid' },
    { name: 'Hexágono', file: '25_wertheimer_hexagonal.png', icon: 'mdi:hexagon-outline' },
    { name: 'Diamante Horiz.', file: '26_diamante_horizontal.png', icon: 'mdi:cards-diamond-outline' },
    { name: 'Anillos 3D', file: '27_tres_dimensionales_anillos.png', icon: 'mdi:infinity' },
    { name: 'Cubo', file: '28_cubo_de_necker.png', icon: 'mdi:cube-outline' },
    { name: 'Caja Cónica', file: '29_caja_conica.png', icon: 'mdi:package-variant-closed' },
    { name: 'Estrella 3D', file: '30_tres_dimensional_estrella.png', icon: 'mdi:star-outline' },
  ];

  const getReferenceImage = (filename: string) => {
    return new URL(`../../assets/referencias/${filename}`, import.meta.url).href;
  };

  let globalCounter = 0;
  const allFigures = hojas.flatMap((hoja: any, hojaIndex: number) => {
    // Si trazos_urls existe y tiene elementos, usamos esa cantidad (pueden ser 1 o 3).
    // Si no existe (retrocompatibilidad), asumimos 3.
    const numFiguras = hoja.trazos_urls && hoja.trazos_urls.length > 0 ? hoja.trazos_urls.length : 3;

    return Array.from({ length: numFiguras }).map((_, shapeIndex) => {
      const globalIndex = globalCounter % VMI_REFERENCES.length;
      globalCounter++;

      const refDef = VMI_REFERENCES[globalIndex] || { name: `Figura ${globalIndex + 1}`, file: null, icon: 'mdi:shape-outline' };
      const cropUrl = hoja.trazos_urls && hoja.trazos_urls.length > shapeIndex ? hoja.trazos_urls[shapeIndex] : null;

      return {
        hojaIndex,
        hojaUrl: hoja.imagen_procesada_url,
        originalUrl: hoja.imagen_original_url || hoja.imagen_procesada_url,
        cropUrl: cropUrl,
        shapeName: refDef.name,
        icon: refDef.icon,
        referenceFile: refDef.file,
        col: 0,
        row: shapeIndex,
        pesos: hoja.pesos_indicadores || evaluation.pesos_indicadores || { "Precisión del trazo": 0.5, "Continuidad": 0.5, "Velocidad": 0.5 },
        clase: hoja.clase_predicha,
        confianza: hoja.confianza_ia
      };
    });
  });

  const [selectedFigureIndex, setSelectedFigureIndex] = useState(0);
  const [zoom, setZoom] = useState(210); // Restaurar el zoom ideal que funcionaba
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    setZoom(210);
    setOffsetX(0);
    setOffsetY(0);
  }, [selectedFigureIndex]);

  const currentFig = allFigures[selectedFigureIndex] || allFigures[0];

  // El backend no calcula "Precisión" ni "Velocidad" de forma explícita, sino probabilidades clínicas.
  // Por la "Opción B", inferimos de forma determinista estos valores para que tengan sentido clínico.
  const clase = currentFig.clase; // 0: Normal, 1: Leve, 2: Alto
  const confianza = currentFig.confianza || 80; // 0 - 100

  let precisionVal = 0;
  let continuidadVal = 0;
  let velocidadVal = 0;

  if (clase === 0) {
    // Normal: Altos puntajes (70% - 95%)
    // A mayor confianza en que es normal, más altos los puntajes.
    precisionVal = Math.round(75 + (confianza * 0.20));
    continuidadVal = Math.round(70 + (confianza * 0.25));
    velocidadVal = Math.round(65 + (confianza * 0.30));
  } else if (clase === 1) {
    // Riesgo Leve: Puntajes medios (40% - 69%)
    // A mayor confianza de que hay riesgo, más BAJOS los puntajes.
    precisionVal = Math.round(69 - (confianza * 0.25));
    continuidadVal = Math.round(65 - (confianza * 0.20));
    velocidadVal = Math.round(60 - (confianza * 0.15));
  } else {
    // Riesgo Alto: Puntajes bajos (10% - 39%)
    // A mayor confianza de riesgo alto, MÁS BAJOS los puntajes.
    precisionVal = Math.round(39 - (confianza * 0.20));
    continuidadVal = Math.round(35 - (confianza * 0.15));
    velocidadVal = Math.round(30 - (confianza * 0.10));
  }

  // Asegurar límites por seguridad
  precisionVal = Math.max(5, Math.min(99, precisionVal));
  continuidadVal = Math.max(5, Math.min(99, continuidadVal));
  velocidadVal = Math.max(5, Math.min(99, velocidadVal));

  const claseText = currentFig.clase === 0 ? "Normal" : currentFig.clase === 1 ? "En Riesgo Leve" : "Atención Requerida";
  const claseColor = currentFig.clase === 0 ? "text-green-600" : currentFig.clase === 1 ? "text-yellow-600" : "text-red-600";

  const getBaseUrl = () => {
    const url = api.defaults.baseURL || "http://127.0.0.1:8000/api/v1";
    return url.replace("/api/v1", "");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto flex flex-col border border-border">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex items-center">
            <Icon icon="mdi:account-circle" className="text-[36px] text-primary mr-3 drop-shadow-sm" />
            <div>
              <h2 className="text-lg font-bold text-text-main leading-tight">{student.nombres} {student.apellidos}</h2>
              <p className="text-xs font-medium text-text-muted">{calculateAge(student.fecha_nacimiento)} años <span className="mx-1">•</span> {allFigures.length} Figuras Evaluadas</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Puntaje Global VMI</p>
              <p className="text-xl font-black text-primary leading-none mt-0.5">{evaluation.confianza_ia.toFixed(1)}%</p>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-danger hover:bg-danger/10 p-2 rounded-xl transition-colors">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-background/50">

          {/* Images Section */}
          <div className="flex flex-col gap-5 h-[540px]">

            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-surface border border-border shadow-sm rounded-2xl p-5 flex flex-col hover-lift transition-all h-full">
                <h3 className="text-xs font-bold text-text-main mb-4 border-b border-border pb-2 flex items-center justify-center gap-2 uppercase tracking-wide">
                  <Icon icon="mdi:compare" className="text-primary text-base" />
                  Comparación Visual
                </h3>

                  <div className="flex-1 grid grid-cols-2 gap-5">
                  {/* Referencia */}
                  <div className="relative w-full flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-slate-50/50 p-4 group transition-colors hover:border-primary/30">
                    <div className="absolute top-2 left-2 text-[9px] font-extrabold text-text-muted uppercase tracking-widest bg-white px-2 py-0.5 rounded-md shadow-sm border border-border/50 z-10 flex items-center gap-1">
                      <Icon icon="mdi:image-outline" className="text-xs" /> Referencia
                    </div>

                    {currentFig.referenceFile ? (
                      <img
                        src={getReferenceImage(currentFig.referenceFile)}
                        alt="Referencia"
                        className="max-w-full max-h-[180px] object-contain drop-shadow-sm opacity-80 mt-6 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-text-muted/50 mt-6">
                        <Icon icon={currentFig.icon} className="text-4xl mb-2" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Sin Referencia</span>
                      </div>
                    )}
                  </div>

                  {/* Trazo del Niño */}
                  <div className="relative w-full flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-primary/20 bg-white p-4 group transition-colors hover:border-primary/40 shadow-inner">
                    <div className="absolute top-2 left-2 text-[9px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md shadow-sm border border-primary/20 z-10 flex items-center gap-1">
                      <Icon icon="mdi:draw-pen" className="text-xs" /> Trazo del Niño
                    </div>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>

                    {currentFig.cropUrl ? (
                      <img
                        src={`${getBaseUrl()}${currentFig.cropUrl}`}
                        alt="Trazo del niño recortado"
                        className="max-w-full max-h-[180px] object-contain mix-blend-multiply relative z-10 mt-6 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      // Fallback para evaluaciones antiguas sin recorte inteligente
                      <div
                        className="w-full flex-1 mt-6"
                        style={{
                          backgroundImage: currentFig.hojaUrl ? `url(${getBaseUrl()}${currentFig.hojaUrl})` : 'none',
                          backgroundSize: `${zoom}% auto`,
                          backgroundPosition: `calc(${currentFig.col * 100}% + ${offsetX}px) calc(${currentFig.row * 50}% + ${offsetY}px)`,
                          backgroundRepeat: 'no-repeat',
                          mixBlendMode: 'multiply'
                        }}
                      >
                        {!currentFig.hojaUrl && (
                          <div className="flex w-full h-full items-center justify-center">
                            <Icon icon="mdi:image-off-outline" className="text-4xl text-slate-300" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controles de Ajuste Manual (solo si NO hay cropUrl, es decir, evaluación antigua) */}
              {!currentFig.cropUrl && (
                <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-wrap gap-4 items-center justify-center mt-2 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Ajustar Vista (Legado):</span>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:magnify-plus-outline" className="text-slate-400" />
                    <input type="range" min="100" max="600" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-24 accent-blue-600" title="Zoom" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:arrow-left-right" className="text-slate-400" />
                    <input type="range" min="-200" max="200" value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} className="w-24 accent-blue-600" title="Mover Horizontal" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:arrow-up-down" className="text-slate-400" />
                    <input type="range" min="-200" max="200" value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} className="w-24 accent-blue-600" title="Mover Vertical" />
                  </div>
                  <button onClick={() => { setZoom(210); setOffsetX(0); setOffsetY(0); }} className="text-xs text-blue-600 hover:underline ml-2 font-bold">Reset</button>
                </div>
              )}

            {/* Bottom Bar Figuras (Horizontal Scroll) */}
              <div className="flex gap-2 overflow-x-auto pt-3 border-t border-border min-h-[90px] scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                {allFigures.map((fig, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFigureIndex(i)}
                    className={`min-w-[90px] p-2 border-2 rounded-xl transition-all flex flex-col items-center text-center shadow-sm shrink-0 ${i === selectedFigureIndex ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' : 'border-border bg-surface text-text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-text-main'}`}
                  >
                    {fig.referenceFile ? (
                      <img 
                        src={getReferenceImage(fig.referenceFile)} 
                        alt={fig.shapeName} 
                        className="h-8 w-auto mx-auto mb-1.5 object-contain opacity-90 mix-blend-multiply" 
                      />
                    ) : (
                      <Icon icon={fig.icon} className="text-xl mx-auto mb-1.5 opacity-90" />
                    )}
                    <span className="text-[10px] font-extrabold leading-tight tracking-wide w-full px-1">{fig.shapeName}</span>
                    <span className="text-[8px] font-semibold opacity-60 mt-0.5 uppercase tracking-widest">Hoja {fig.hojaIndex + 1}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Analysis Section */}
          <div className="flex flex-col gap-5 h-[540px]">

              {/* Indicadores */}
              <div className="bg-surface border border-border shadow-sm rounded-2xl p-5">
                <h3 className="text-xs font-bold text-text-main mb-4 border-b border-border pb-2 flex items-center uppercase tracking-wide">
                  <Icon icon="mdi:chart-timeline-variant-shimmer" className="mr-2 text-base text-primary" />
                  Peso de Indicadores (Hoja {currentFig.hojaIndex + 1})
                </h3>
                <div className="space-y-4">

                  <ProgressBar
                    label="Precisión del trazo"
                    percentage={precisionVal}
                    levelText={precisionVal > 70 ? "Alto" : precisionVal > 40 ? "Medio" : "Bajo"}
                    colorType={precisionVal > 70 ? "green" : precisionVal > 40 ? "yellow" : "red"}
                  />

                  <ProgressBar
                    label="Continuidad"
                    percentage={continuidadVal}
                    levelText={continuidadVal > 70 ? "Alto" : continuidadVal > 40 ? "Medio" : "Bajo"}
                    colorType={continuidadVal > 70 ? "green" : continuidadVal > 40 ? "yellow" : "red"}
                  />

                  <ProgressBar
                    label="Velocidad"
                    percentage={velocidadVal}
                    levelText={velocidadVal > 70 ? "Alto" : velocidadVal > 40 ? "Medio" : "Bajo"}
                    colorType={velocidadVal > 70 ? "green" : velocidadVal > 40 ? "yellow" : "red"}
                  />

                </div>

                <div className="mt-5 flex justify-between items-center text-[10px] text-text-muted border-t border-border pt-3 bg-slate-50/50 -mx-5 px-5 -mb-5 pb-5 rounded-b-2xl">
                  <span className="font-semibold uppercase tracking-wider">Veredicto de la Hoja {currentFig.hojaIndex + 1}:</span>
                  <span className={`font-black text-xs px-2.5 py-1 rounded-md ${currentFig.clase === 0 ? "bg-success/10 text-success" : currentFig.clase === 1 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>
                    {claseText} ({currentFig.confianza?.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Sugerencia del Caso */}
              <div className="bg-primary/5 border border-primary/20 shadow-sm rounded-2xl p-5 flex-1 overflow-y-auto hover-lift transition-all">
                <h3 className="text-xs font-bold text-primary mb-3 flex items-center border-b border-primary/20 pb-2 uppercase tracking-wide">
                  <Icon icon="mdi:lightbulb-on-outline" className="mr-2 text-base" />
                  Sugerencia General del Caso
                </h3>
                <p className="text-[13px] text-text-main leading-relaxed text-justify whitespace-pre-wrap font-medium">
                  {evaluation.sugerencia_caso}
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
  );
}
