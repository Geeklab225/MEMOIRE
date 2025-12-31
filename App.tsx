
import React, { useState, useRef } from 'react';
import { 
  Search, FileText, Loader2, CheckCircle2, 
  AlertCircle, FileDown, 
  Users, GraduationCap, MapPin, Wand2, Sparkles, GraduationCap as School, 
  Rocket, Hash, UserCircle, ChevronRight
} from 'lucide-react';
import { ThesisData, ThesisMetadata, Student } from './types';
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
    if (!theme.trim() || !metadata.defensePlace || !metadata.antenne || !metadata.supervisor) {
      setError("Les informations méthodologiques clés (Thème, Site, Antenne, Directeur) sont obligatoires.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const currentMetadata = { ...metadata, students };
      const { isReady, missingInfo } = await verifyThesisInfo(theme, currentMetadata);
      if (!isReady) {
        setError(`Vérification Méthodologique : ${missingInfo}`);
        setLoading(false);
        return;
      }
      const { sources } = await searchSources(theme);
      setData(prev => ({ ...prev, theme, metadata: currentMetadata, sources }));
      setStep(2);
    } catch (err) {
      setError("Impossible de contacter le serveur d'analyse académique. Veuillez vérifier votre connexion.");
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
        const content = await generateSectionContent(data.theme, updatedSections[i].title, previous, data.sources, data.metadata);
        updatedSections[i].content = content;
        updatedSections[i].status = 'completed';
        setData(prev => ({ ...prev, sections: [...updatedSections] }));
        if (scrollRef.current) {
           scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
      } catch (err) {
        setError("Interruption de la rédaction scientifique à : " + updatedSections[i].title);
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
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1 opacity-80 italic">Mémoire de Fin de Formation</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
             <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Canevas INFAS 2024</span>
             </div>
             <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold border border-orange-300 text-[10px] uppercase tracking-wider shadow-sm">
               💰 Tarif unique : 130 000 FCFA / mémoire (par groupe)
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-6 space-y-10">
                  <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[11px] font-black text-primary uppercase flex items-center gap-3 tracking-widest">
                        <Users className="w-5 h-5 text-accent"/> Groupe d'Étude
                      </h3>
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400">GROUPE N°</span>
                        <input 
                          value={metadata.groupNumber}
                          onChange={e => setMetadata({...metadata, groupNumber: e.target.value})}
                          placeholder="……"
                          className="w-12 text-center font-black text-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {students.map((s, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 group/row">
                          <div className="relative">
                            <input 
                              value={s.name} 
                              onChange={e => updateStudent(i, 'name', e.target.value)} 
                              placeholder={`NOM Prénoms Étudiant ${i+1}`} 
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-accent outline-none shadow-sm transition-all focus:ring-4 focus:ring-accent/5" 
                            />
                            <UserCircle className="absolute right-3 top-3 w-4 h-4 text-slate-300 group-focus-within/row:text-accent transition-colors" />
                          </div>
                          <div className="relative">
                            <input 
                              value={s.matricule} 
                              onChange={e => updateStudent(i, 'matricule', e.target.value)} 
                              placeholder="Matricule" 
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-accent outline-none shadow-sm transition-all focus:ring-4 focus:ring-accent/5" 
                            />
                            <Hash className="absolute right-3 top-3 w-4 h-4 text-slate-300 group-focus-within/row:text-accent transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-accent"/> Composition du Jury
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Président du Jury</label>
                        <input value={metadata.juryPresident} onChange={e => setMetadata({...metadata, juryPresident: e.target.value})} placeholder="M/Mme NOM Prénoms" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Assesseur du Jury</label>
                        <input value={metadata.juryAssessor} onChange={e => setMetadata({...metadata, juryAssessor: e.target.value})} placeholder="M/Mme NOM Prénoms" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Directeur de mémoire</label>
                        <input value={metadata.supervisor} onChange={e => setMetadata({...metadata, supervisor: e.target.value})} placeholder="Nom et Grade du Directeur" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-6 space-y-10">
                  <section className="space-y-6">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-accent"/> Soutenance & Promotion
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input value={metadata.defensePlace} onChange={e => setMetadata({...metadata, defensePlace: e.target.value})} placeholder="Lieu de soutenance" className="w-full p-4 border border-slate-100 rounded-xl text-sm font-bold shadow-sm" />
                      <input value={metadata.defenseDate} onChange={e => setMetadata({...metadata, defenseDate: e.target.value})} placeholder="Date de soutenance" className="w-full p-4 border border-slate-100 rounded-xl text-sm font-bold shadow-sm" />
                      <input value={metadata.antenne} onChange={e => setMetadata({...metadata, antenne: e.target.value})} placeholder="Antenne INFAS" className="w-full p-4 border border-slate-100 rounded-xl text-sm font-bold shadow-sm" />
                      <input value={metadata.promotion} onChange={e => setMetadata({...metadata, promotion: e.target.value})} placeholder="Promotion (ex: 2022-2025)" className="w-full p-4 border border-slate-100 rounded-xl text-sm font-bold shadow-sm" />
                    </div>
                  </section>
                  
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent"/> Thème du Mémoire
                    </label>
                    <textarea 
                      value={theme} 
                      onChange={e => setTheme(e.target.value)} 
                      className="w-full h-80 p-10 border-4 border-slate-50 rounded-[2.5rem] focus:ring-8 focus:ring-accent/5 focus:border-accent outline-none font-black text-2xl text-primary leading-snug shadow-inner transition-all resize-none placeholder:text-slate-200" 
                      placeholder="Saisissez ici l'intégralité du thème validé..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON WITH PREMIUM GRADIENT AND HOVER EFFECTS */}
              <button 
                onClick={handleStartAnalysis} 
                disabled={loading} 
                className="w-full bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white py-4 px-7 text-[1.05rem] font-bold rounded-[16px] border-2 border-[#0F172A] shadow-[0_12px_30px_rgba(249,115,22,0.45)] hover:bg-[#0F172A] hover:text-[#F97316] hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(15,23,42,0.6)] transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <Rocket className="w-7 h-7 group-hover:rotate-12 transition-transform" />}
                🚀 Commence ta rédaction du mémoire
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-20 text-center bg-gradient-to-b from-blue-50/30 to-white animate-in zoom-in duration-700">
              <div className="inline-flex p-10 bg-blue-100 rounded-full mb-10 shadow-2xl border-4 border-white">
                <CheckCircle2 className="w-16 h-16 text-accent" />
              </div>
              <h3 className="text-4xl font-black text-primary mb-6 tracking-tight italic">Analyse Académique Réussie</h3>
              <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-xl font-medium leading-relaxed">
                Le canevas INFAS est prêt. L'IA a indexé les sources institutionnelles réelles pour garantir la crédibilité de votre rédaction scientifique.
              </p>
              <button 
                onClick={handlePlan} 
                className="bg-primary text-white px-16 py-6 rounded-xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
              >
                Générer le Plan Méthodologique <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="p-12 space-y-10 animate-in fade-in duration-700">
              <div className="flex items-center justify-between border-b-2 border-slate-50 pb-8">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight italic">Structure Scientifique (18 Chapitres)</h3>
                <div className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Canevas INFAS 2-1</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {data.plan.map((p, i) => (
                  <div key={i} className={`p-6 border-2 rounded-[2rem] flex gap-5 items-center transition-all group ${p.includes("PARTIE") ? "bg-primary text-white border-primary shadow-xl" : "bg-white text-slate-700 border-slate-100 shadow-md hover:border-accent"}`}>
                    <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-lg shadow-lg ${p.includes("PARTIE") ? "bg-accent text-white" : "bg-blue-50 text-accent"}`}>{i+1}</span>
                    <span className="text-xs font-black uppercase tracking-wide leading-tight">{p}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={generateFullThesis} 
                disabled={loading} 
                className="w-full bg-accent text-white py-6 rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-5 hover:bg-blue-700 transition-all shadow-blue-500/20"
              >
                {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <Wand2 className="w-7 h-7" />}
                Lancer la Rédaction Scientifique Automatisée
              </button>
            </div>
          )}

          {(step === 4 || (loading && step === 3)) && (
            <div className="flex flex-col h-[850px] bg-primary">
              <div className="p-6 bg-primary text-white flex justify-between items-center border-b border-white/5 shadow-2xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Protocole de rédaction en cours...</span>
                  <span className="text-sm font-black truncate max-w-xl uppercase italic opacity-90 tracking-tight">{data.theme}</span>
                </div>
                {loading && (
                  <div className="flex items-center gap-4 bg-blue-600/10 px-6 py-2.5 rounded-2xl border border-blue-500/20 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-[11px] font-black uppercase tracking-tighter">Rédaction en cours...</span>
                  </div>
                )}
              </div>
              
              <div ref={scrollRef} className="flex-1 p-10 md:p-16 overflow-y-auto space-y-16 bg-bgsoft custom-scrollbar scroll-smooth">
                {data.sections.map((s, i) => (
                  <div key={s.id} className={`group relative bg-white border-2 rounded-[3rem] shadow-xl transition-all duration-1000 ${s.status === 'generating' ? 'ring-8 ring-accent/5 border-accent scale-[1.02]' : 'border-slate-100'}`}>
                    <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/40 rounded-t-[3rem]">
                      <div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 block italic">Chapitre {i+1}</span>
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
                          <p key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {line}
                          </p>
                        ))
                      ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-slate-200 gap-6">
                          <Loader2 className={`w-12 h-12 ${s.status === 'generating' ? 'animate-spin text-blue-400' : 'opacity-10'}`} />
                          <p className="text-[11px] font-black uppercase tracking-[0.3em]">
                            {s.status === 'generating' ? "Analyse & Syntèse Scientifique..." : "Séquence en attente..."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {step === 4 && (
                <div className="p-10 bg-white border-t-2 border-slate-100 flex flex-col md:flex-row gap-6 shadow-[0_-20px_50px_rgba(10,37,64,0.05)]">
                  <button 
                    onClick={() => exportToWord(data)} 
                    className="flex-1 bg-white text-primary py-6 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-slate-50 transition-all border-2 border-slate-200 shadow-lg group"
                  >
                    <FileText className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" /> Exporter en Word (.docx)
                  </button>
                  <button 
                    onClick={() => exportToPDF(data)} 
                    className="flex-1 bg-success text-white py-6 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-green-600 transition-all shadow-2xl shadow-success/20 group"
                  >
                    <FileDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> Télécharger en PDF Final
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
           <p className="text-[11px] font-black uppercase tracking-[0.5em]">Assistant de Rédaction Scientifique INFAS • 2024</p>
           <p className="text-[9px] font-medium uppercase tracking-widest opacity-40 italic">Expertise Académique • Innovation Santé • Excellence</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
