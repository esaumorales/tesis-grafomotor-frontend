import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import api from '../../services/api';

interface NewEvaluationModalProps {
  student: any;
  onClose: () => void;
}

export default function NewEvaluationModal({ student, onClose }: NewEvaluationModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Phase 1: Uploading to AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  
  // Phase 2: Form data
  const [observaciones, setObservaciones] = useState('');
  
  // Phase 3: Saving to DB
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      const urls = selectedFiles.map(f => URL.createObjectURL(f));
      setPreviewUrls(urls);
      
      setAiResult(null); // Reset prev analysis
      setErrorMsg('');
    }
  };

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await api.post('/evaluate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAiResult(response.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Error al analizar la imagen con la IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (files.length === 0 || !aiResult) return;
    setIsSaving(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('original_images', file);
      });
      
      const evaluationData = {
        clase_predicha: aiResult.clase_predicha,
        confianza_ia: aiResult.confianza_general,
        pesos_indicadores: aiResult.pesos_indicadores,
        sugerencia_caso: observaciones ? `${aiResult.sugerencia_caso}\n\nNotas Prof: ${observaciones}` : aiResult.sugerencia_caso,
        hojas: aiResult.hojas
      };
      
      formData.append('evaluation_data_str', JSON.stringify(evaluationData));

      await api.post(`/students/${student.id}/evaluations`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onClose();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Error al guardar la evaluación.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-border my-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col p-6 border-b border-border bg-primary/5 relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary flex items-center">
              <Icon icon="mdi:file-document-plus-outline" className="text-secondary mr-2 text-2xl" />
              Nueva Evaluación Grafomotora
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>
          <div className="flex items-center text-sm bg-white p-3 rounded-xl border border-border shadow-sm w-fit">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
              <Icon icon="mdi:account-outline" className="text-2xl" />
            </div>
            <div>
              <p className="text-text-main font-bold text-base leading-tight mb-1">{student.nombres} {student.apellidos}</p>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">Edad: {calculateAge(student.fecha_nacimiento)}</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">Lateralidad: {student.lateralidad}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-background/50 flex-1 overflow-y-auto">
          
          {/* Columna Izquierda: Carga de Imagen */}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-text-main mb-4 flex items-center">
              <div className="w-6 h-6 rounded-full bg-secondary text-primary font-black flex items-center justify-center mr-2 text-xs shadow-sm">1</div>
              Subir Dibujo
            </h3>
            
            <input 
              type="file" 
              accept="image/*" 
              multiple
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            
            <div 
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center flex-1 min-h-[280px] cursor-pointer transition-all relative overflow-hidden ${previewUrls.length > 0 ? 'border-primary/40 bg-primary/5' : 'border-border bg-surface hover:border-primary/50 hover:bg-primary/5'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrls.length > 0 ? (
                <div className="absolute inset-0 overflow-y-auto p-4 grid grid-cols-2 gap-3 h-max" style={{ scrollbarWidth: 'thin' }}>
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-border shadow-sm aspect-video h-fit">
                      <img src={url} alt={`Preview ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">Hoja {i+1}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
                    <Icon icon="mdi:cloud-upload-outline" className="text-3xl" />
                  </div>
                  <h4 className="text-sm font-bold text-text-main mb-1">Haz clic para seleccionar las hojas</h4>
                  <p className="text-xs text-text-muted max-w-[200px]">Asegúrate de que las fotos estén bien iluminadas. Soporta JPG y PNG.</p>
                </div>
              )}
            </div>

            {files.length > 0 && !aiResult && (
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="mt-5 bg-gradient-to-r from-primary to-primary-hover text-white w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center hover:-translate-y-0.5"
              >
                {isAnalyzing ? (
                  <><Icon icon="mdi:loading" className="animate-spin mr-2 text-xl" /> Procesando con IA...</>
                ) : (
                  <><Icon icon="mdi:robot-outline" className="mr-2 text-xl" /> Analizar {files.length} {files.length === 1 ? 'Hoja' : 'Hojas'}</>
                )}
              </button>
            )}
          </div>

          {/* Columna Derecha: Resultados de IA */}
          <div className="flex flex-col h-full border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
            <h3 className="text-sm font-bold text-text-main mb-4 flex items-center">
              <div className="w-6 h-6 rounded-full bg-secondary text-primary font-black flex items-center justify-center mr-2 text-xs shadow-sm">2</div>
              Resultados de la IA
            </h3>
            
            {errorMsg && (
              <div className="mb-4 p-4 rounded-xl bg-danger/10 text-danger border border-danger/20 text-sm font-medium flex items-start">
                <Icon icon="mdi:alert-circle-outline" className="text-xl mr-2 shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            {!aiResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted bg-surface border border-border border-dashed rounded-2xl p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Icon icon="mdi:robot-outline" className="text-3xl" />
                </div>
                <h4 className="text-sm font-bold text-slate-400 mb-1">Esperando imágenes</h4>
                <p className="text-xs text-center max-w-[220px]">Sube el dibujo y presiona Analizar para obtener el diagnóstico automático.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm flex flex-col items-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10"></div>
                   <p className="text-[10px] text-text-muted uppercase tracking-widest font-extrabold mb-2">Diagnóstico VMI Predicho</p>
                   {(() => {
                     // Extraer VMI_CAT de la sugerencia si existe
                     const match = aiResult.sugerencia_caso.match(/VMI_CAT=([^|]+)\|/);
                     const vmiCat = match ? match[1] : (aiResult.clase_predicha === 0 ? "Normal" : aiResult.clase_predicha === 1 ? "Riesgo Leve" : "Riesgo Alto");
                     const colorClass = aiResult.clase_predicha === 0 ? "text-success" : aiResult.clase_predicha === 1 ? "text-warning" : "text-danger";
                     return <h4 className={`text-xl text-center font-black mb-1 ${colorClass}`}>{vmiCat}</h4>;
                   })()}
                   {(() => {
                     const matchScore = aiResult.sugerencia_caso.match(/VMI_SCORE=([^|]+)\|/);
                     const score = matchScore ? matchScore[1] : aiResult.confianza_general.toFixed(1);
                     return <p className="text-xs font-semibold text-text-muted bg-slate-100 px-3 py-1 rounded-full border border-border">Puntuación Estándar: <span className="font-bold text-text-main">{score}</span></p>;
                   })()}
                </div>

                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 shadow-sm">
                  <p className="text-xs font-bold text-primary mb-2 flex items-center uppercase tracking-wider">
                    <Icon icon="mdi:lightbulb-on-outline" className="mr-1.5 text-lg" /> Sugerencia de la IA
                  </p>
                  <p className="text-sm text-text-main leading-relaxed font-medium">
                    {aiResult.sugerencia_caso.split('||').pop()}
                  </p>
                </div>

                <div className="flex-1 flex flex-col mt-2">
                  <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Observaciones Adicionales (Opcional)</label>
                  <textarea 
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Añade notas sobre el comportamiento del estudiante, su postura al dibujar, etc..." 
                    className="w-full flex-1 min-h-[100px] border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface resize-none transition-all"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border bg-surface">
          <button onClick={onClose} type="button" className="px-6 py-2.5 border border-border bg-white text-text-main rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!aiResult || isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-secondary to-secondary-hover text-primary rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center hover:-translate-y-0.5"
          >
            {isSaving && <Icon icon="mdi:loading" className="animate-spin mr-2 text-lg" />}
            {isSaving ? 'Guardando...' : 'Guardar Resultados'}
          </button>
        </div>

      </div>
    </div>
  );
}

