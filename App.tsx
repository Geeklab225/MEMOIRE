
import React, { useState, useRef } from 'react';
import { 
  FileText, Loader2, CheckCircle2, 
  AlertCircle, FileDown, 
  Users, GraduationCap, MapPin, Sparkles, GraduationCap as School, 
  Rocket, Hash, UserCircle, ChevronRight, Wand2, Target, HelpCircle, ListChecks
} from 'lucide-react';
import { ThesisData, ThesisMetadata, Student, DeducedLogic } from './types';
import { searchSources, generatePlan, generateSectionContent, verifyThesisInfo } from './services/gemini';
import { exportToPDF, exportToWord } from './utils/export';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([
    { name: '', matricule: '' },
    { name: '', matricule: '' },
    { name: '', matricule: '' },
    { name: '', matricule: '' },
    { name: '', matricule: '' },
    { name: '', matricule: '' }
  ]);
  
  const [metadata, setMetadata] = useState<ThesisMetadata>({
    author: 'GROUPE D\'ÉTUDE INFAS',
    groupNumber: '',
    students: [],
    speciality: 'Soins Infirmiers et Obstétricaux',
    option: 'Infirmier Diplômé d\'État',
    promotion: '2022-2025',
    academicYear: '2024-2025',
    antenne: 'Abidjan',
    defenseDate: 'Août 2025',
    defensePlace: 'CHU de Cocody',
    juryPresident: '',
    juryAssessor: '',
    supervisor: '',
    supervisorTitle: 'Directeur de Mémoire',
    studyType: 'Étude prospective à visée descriptive',
    population: 'Agents de santé et Patients',
    sampleSize: '100 participants'
  });

  const [theme, setTheme] = useState('');
  const [data, setData] = useState<ThesisData>({
    theme: '',
    metadata: metadata,
    sources: [],
    plan: [],
    sections: []
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const updateStudent = (index: number, field: keyof Student, val: string) => {
    const newStudents = [...students];
    newStudents[index] = { ...newStudents[index], [field]: val };
    setStudents(newStudents);
  };

  const handleStartAnalysis = async () => {
    if (!theme.trim()) {
      setError("Le THÈME est indispensable. C'est de lui que tout le mémoire sera extrait.");
      return;
    }
    if (!metadata.defensePlace || !metadata.supervisor) {
      setError("Le Lieu de l'étude et le Directeur de mémoire sont obligatoires.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const currentMetadata = { ...metadata, students };
      const { isReady, missingInfo, deducedLogic } = await verifyThesisInfo(theme, currentMetadata);
      if (!isReady) {
        setError(`Analyse du Thème : ${missingInfo}`);
        setLoading(false);
        return;
      }
      const { sources } = await searchSources(theme);
      setData(prev => ({ ...prev, theme, metadata: currentMetadata, sources, deducedLogic }));
      setStep(2);
    } catch (err) {
      setError("L'IA n'a pas pu analyser le thème. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlan = async () => {
    setLoading(true);
    const plan = await generatePlan();
    setData(prev => ({ 
      ...prev, 
      plan,
      sections: plan.map(title => ({
        id: Math.random().toString(36).substr(2, 9),
        title,
        content: '',
        status: 'idle' as const
      }))
    }));
    setStep(3);
    setLoading(false);
  };

  const generateFullThesis = async () => {
    setLoading(true);
    const updatedSections = [...data.sections];
    for (let i = 0; i < updatedSections.length; i++) {
      updatedSections[i].status = 'generating';
      setData(prev => ({ ...prev, sections: [...updatedSections] }));
      try {
        const previous = i > 0 ? updatedSections[i-1].content : "";
        const content = await generateSectionContent(data.theme, updatedSections[i].title, previous, data.sources, data.metadata, data.deducedLogic);
        updatedSections[i].content = content;
        updatedSections[i].status = 'completed';
        setData(prev => ({ ...prev, sections: [...updatedSections] }));
        if (scrollRef.current) {
           scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
      } catch (err) {
        setError("Erreur lors de la rédaction du chapitre : " + updatedSections[i].title);
        break;
      }
    }
    setLoading(false);
    if (!error) setStep(4);
  };

  return (
    <div className="min-h-screen bg-bgsoft flex flex-col text-textsoft selection:bg-blue-100">
      <nav className="bg-primary text-white h-20 flex items-center px-8 sticky top-0 z-50 border-b-4 border-accent shadow-xl">
        <div className="flex items-center gap-5 w-full max-w-7xl mx-auto">
          <div className="p-3 bg-accent rounded-xl shadow-lg">
            <School className="text-white w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="font-black uppercase tracking-tight text-xl leading-none">Assistant IA INFAS</h1>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1 opacity-80 italic">Cerveau Scientifique de Rédaction</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
             <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Analyse Thématique Avancée</span>
             </div>
             <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold border border-orange-300 text-[10px] uppercase tracking-wider shadow-sm">
               💰 130 000 FCFA / mémoire complet
             </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 lg:p-14">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
          {error && (
            <div className="p-6 bg-red-50 text-red-900 flex items-center gap-5 border-b-2 border-red-100 animate-in fade-in duration-500">
              <div className="bg-red-500 p-2 rounded-full shadow-lg shadow-red-200">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="p-10 lg:p-14 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-2xl">
                    <Wand2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Le Thème : Cœur de la Recherche</h2>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Toute la logique scientifique sera extraite de ce thème</p>
                  </div>
                </div>
                <textarea 
                  value={theme} 
                  onChange={e => setTheme(e.target.value)} 
                  className="w-full h-64 p-10 border-4 border-slate-50 rounded-[2.5rem] focus:ring-8 focus:ring-accent/5 focus:border-accent outline-none font-black text-2xl text-primary leading-snug shadow-inner transition-all resize-none placeholder:text-slate-200" 
                  placeholder="Saisissez ici votre thème validé par l'INFAS..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-6 space-y-10">
                  <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[11px] font-black text-primary uppercase flex items-center gap-3 tracking-widest">
                        <Users className="w-5 h-5 text-accent"/> Groupe d'Étude
                      </h3>
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400">N°</span>
                        <input value={metadata.groupNumber} onChange={e => setMetadata({...metadata, groupNumber: e.target.value})} placeholder="…" className="w-10 text-center font-black text-primary outline-none" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {students.map((s, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input value={s.name} onChange={e => updateStudent(i, 'name', e.target.value)} placeholder={`Nom Étudiant ${i+1}`} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-accent outline-none" />
                          <input value={s.matricule} onChange={e => updateStudent(i, 'matricule', e.target.value)} placeholder="Matricule" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-accent outline-none" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-6 space-y-10">
                  <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-accent"/> Éléments d'Encadrement
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <input value={metadata.supervisor} onChange={e => setMetadata({...metadata, supervisor: e.target.value})} placeholder="Directeur de mémoire" className="w-full p-4 border border-white rounded-xl text-sm font-bold shadow-sm" />
                      <input value={metadata.defensePlace} onChange={e => setMetadata({...metadata, defensePlace: e.target.value})} placeholder="Lieu de l'étude (Hôpital/CHU)" className="w-full p-4 border border-white rounded-xl text-sm font-bold shadow-sm" />
                      <div className="grid grid-cols-2 gap-4">
                         <input value={metadata.antenne} onChange={e => setMetadata({...metadata, antenne: e.target.value})} placeholder="Antenne" className="w-full p-4 border border-white rounded-xl text-sm font-bold shadow-sm" />
                         <input value={metadata.promotion} onChange={e => setMetadata({...metadata, promotion: e.target.value})} placeholder="Promotion" className="w-full p-4 border border-white rounded-xl text-sm font-bold shadow-sm" />
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <button 
                onClick={handleStartAnalysis} 
                disabled={loading} 
                className="w-full bg-primary text-white py-6 px-7 text-xl font-black rounded-3xl border-4 border-slate-900 shadow-2xl hover:-translate-y-2 transition-all flex items-center justify-center gap-4 disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Rocket className="w-8 h-8" />}
                Analyser le thème & Extraire la logique
              </button>
            </div>
          )}

          {step === 2 && data.deducedLogic && (
            <div className="p-10 lg:p-14 space-y-10 animate-in zoom-in duration-500">
              <div className="text-center mb-10">
                <div className="inline-flex p-6 bg-green-100 rounded-full mb-6 border-4 border-white shadow-xl">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </div>
                <h3 className="text-4xl font-black text-primary mb-2 uppercase tracking-tight italic">Analyse thématique réussie</h3>
                <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Voici la feuille de route scientifique déduite de votre thème</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                   <div className="flex items-center gap-4 text-primary">
                      <HelpCircle className="w-6 h-6 text-accent" />
                      <h4 className="font-black uppercase tracking-tighter text-sm">Question de Recherche</h4>
                   </div>
                   <p className="text-lg font-serif italic text-primary leading-relaxed">"{data.deducedLogic.question}"</p>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                   <div className="flex items-center gap-4 text-primary">
                      <Target className="w-6 h-6 text-accent" />
                      <h4 className="font-black uppercase tracking-tighter text-sm">Objectif Général</h4>
                   </div>
                   <p className="text-lg font-black text-primary leading-relaxed uppercase tracking-tight">{data.deducedLogic.objectiveGeneral}</p>
                </div>

                <div className="lg:col-span-2 bg-primary p-10 rounded-[2.5rem] shadow-2xl space-y-6">
                   <div className="flex items-center gap-4 text-white">
                      <ListChecks className="w-7 h-7 text-accent" />
                      <h4 className="font-black uppercase tracking-[0.2em] text-sm">Objectifs Spécifiques</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {data.deducedLogic.objectivesSpecific.map((obj, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex gap-4">
                           <span className="text-accent font-black text-xl italic">{i+1}.</span>
                           <p className="text-xs text-white/80 font-bold leading-relaxed">{obj}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <button 
                onClick={handlePlan} 
                className="w-full bg-accent text-white px-16 py-7 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                Confirmer & Générer le Plan <ChevronRight className="w-7 h-7" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="p-12 space-y-10 animate-in fade-in duration-700">
              <div className="flex items-center justify-between border-b-2 border-slate-50 pb-8">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight italic">Plan Scientifique déduit</h3>
                <div className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Standard INFAS 2024</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {data.plan.map((p, i) => (
                  <div key={i} className={`p-6 border-2 rounded-[2rem] flex gap-5 items-center transition-all group ${p.includes("PARTIE") ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-100 hover:border-accent"}`}>
                    <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-lg ${p.includes("PARTIE") ? "bg-accent text-white" : "bg-blue-50 text-accent"}`}>{i+1}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide leading-tight">{p}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={generateFullThesis} 
                disabled={loading} 
                className="w-full bg-accent text-white py-6 rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-5 hover:bg-blue-700 transition-all disabled:bg-slate-200"
              >
                {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <Rocket className="w-7 h-7" />}
                Lancer la rédaction thématique
              </button>
            </div>
          )}

          {(step === 4 || (loading && step === 3)) && (
            <div className="flex flex-col h-[850px] bg-primary">
              <div className="p-6 bg-primary text-white flex justify-between items-center border-b border-white/5 shadow-2xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Rédaction en cours...</span>
                  <span className="text-sm font-black truncate max-w-xl uppercase italic opacity-90 tracking-tight">{data.theme}</span>
                </div>
              </div>
              
              <div ref={scrollRef} className="flex-1 p-10 md:p-16 overflow-y-auto space-y-16 bg-bgsoft custom-scrollbar scroll-smooth">
                {data.sections.map((s, i) => (
                  <div key={s.id} className={`group relative bg-white border-2 rounded-[3rem] shadow-xl transition-all duration-1000 ${s.status === 'generating' ? 'ring-8 ring-accent/5 border-accent scale-[1.02]' : 'border-slate-100'}`}>
                    <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/40 rounded-t-[3rem]">
                      <div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 block italic">Séquence {i+1}</span>
                        <h3 className="font-black text-primary uppercase text-lg tracking-tight">{s.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.status === 'completed' && <div className="bg-green-100 p-2 rounded-full shadow-inner"><CheckCircle2 className="w-6 h-6 text-success" /></div>}
                        {s.status === 'generating' && <div className="bg-blue-50 p-2 rounded-full animate-spin shadow-inner"><Loader2 className="w-6 h-6 text-accent" /></div>}
                      </div>
                    </div>
                    <div className="p-12 md:p-16 text-base text-slate-800 leading-[1.9] font-serif text-justify space-y-7 animate-in fade-in duration-1000">
                      {s.content ? (
                        s.content.split('\n').filter(l => l.trim() !== "").map((line, idx) => (
                          <p key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-700">{line}</p>
                        ))
                      ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-slate-200 gap-6">
                          <Loader2 className={`w-12 h-12 ${s.status === 'generating' ? 'animate-spin text-blue-400' : 'opacity-10'}`} />
                          <p className="text-[11px] font-black uppercase tracking-[0.3em]">
                            {s.status === 'generating' ? "Rédaction thématique..." : "En attente du thème..."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {step === 4 && (
                <div className="p-10 bg-white border-t-2 border-slate-100 flex flex-col md:flex-row gap-6">
                  <button onClick={() => exportToWord(data)} className="flex-1 bg-white text-primary py-6 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 border-2 border-slate-200 hover:bg-slate-50 transition-all">
                    <FileText className="w-6 h-6 text-accent" /> Exporter en Word
                  </button>
                  <button onClick={() => exportToPDF(data)} className="flex-1 bg-success text-white py-6 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-green-600 transition-all shadow-2xl shadow-success/20">
                    <FileDown className="w-6 h-6" /> Télécharger en PDF Final
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="p-12 text-center bg-primary text-white/40 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
           <School className="w-8 h-8 mx-auto opacity-20 mb-4" />
           <p className="text-[11px] font-black uppercase tracking-[0.5em]">Assistant Thématique INFAS • 2024</p>
           <p className="text-[9px] font-medium uppercase tracking-widest opacity-40 italic">La science au service de la santé</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
