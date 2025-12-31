
import React, { useState, useRef } from 'react';
import { 
  BookOpen, Search, FileText, Loader2, CheckCircle2, 
  AlertCircle, ExternalLink, FileDown, 
  Users, GraduationCap, MapPin, Calendar, Wand2, ListChecks, Plus, Trash2, Info
} from 'lucide-react';
import { ThesisData, ThesisMetadata } from './types';
import { searchSources, generatePlan, generateSectionContent, verifyThesisInfo } from './services/gemini';
import { exportToPDF, exportToWord } from './utils/export';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>(['', '', '', '', '']);
  
  const [metadata, setMetadata] = useState<ThesisMetadata>({
    author: 'GROUPE D\'ÉTUDE INFAS',
    groupMembers: [],
    speciality: 'Soins Infirmiers et Obstétricaux',
    option: 'Infirmier Diplômé d\'État',
    promotion: '2021-2024',
    academicYear: '2023-2024',
    antenne: 'Bondoukou',
    defenseDate: 'Juin 2024',
    defensePlace: 'EPHR Bondoukou',
    juryPresident: 'Dr. KOUASSI',
    juryAssessor: 'M. TRAORE',
    supervisor: 'Mme. KOFFI',
    supervisorTitle: 'Cadre Supérieur de Santé',
    studyType: 'Étude rétrospective à visée descriptive',
    population: 'Dossiers des patients sortis contre avis médical',
    sampleSize: '20 dossiers'
  });

  const [theme, setTheme] = useState('PROBLÉMATIQUE DES SORTIES CONTRE AVIS MÉDICAL À L’EPHR DE BONDOUKOU');
  const [data, setData] = useState<ThesisData>({
    theme: '',
    metadata: metadata,
    sources: [],
    plan: [],
    sections: []
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const addMember = () => setMembers([...members, '']);
  const removeMember = (index: number) => setMembers(members.filter((_, i) => i !== index));
  const updateMember = (index: number, val: string) => {
    const newMembers = [...members];
    newMembers[index] = val;
    setMembers(newMembers);
  };

  const handleStartAnalysis = async () => {
    if (!theme.trim()) {
      setError("Le thème est requis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { isReady, missingInfo } = await verifyThesisInfo(theme, { ...metadata, groupMembers: members });
      if (!isReady) {
        setError(`Informations manquantes : ${missingInfo}`);
        setLoading(false);
        return;
      }
      const { sources } = await searchSources(theme);
      setData(prev => ({ ...prev, theme, metadata: { ...metadata, groupMembers: members }, sources }));
      setStep(2);
    } catch (err) {
      setError("Erreur de connexion lors de la validation.");
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
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      } catch (err) {
        setError("Erreur lors de la rédaction de : " + updatedSections[i].title);
        break;
      }
    }
    setLoading(false);
    if (!error) setStep(4);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <header className="bg-emerald-950 text-white shadow-2xl h-16 flex items-center px-6 sticky top-0 z-50 border-b-4 border-emerald-500">
        <div className="flex items-center gap-3">
          <BookOpen className="text-emerald-400 w-6 h-6" />
          <h1 className="font-black uppercase tracking-tighter text-xl">INFAS MÉMOIRE AI</h1>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 flex items-center gap-3 border-b animate-pulse">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="p-10 space-y-10">
              <section className="text-center space-y-3">
                <h2 className="text-3xl font-black text-emerald-950 uppercase tracking-tight">Configuration Méthodologique</h2>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Référentiel INFAS Côte d'Ivoire</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black text-emerald-800 uppercase flex items-center gap-2"><Users className="w-4 h-4"/> Membres du Groupe (5-6 requis)</h3>
                    {members.map((m, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={m} onChange={e => updateMember(i, e.target.value)} placeholder={`Étudiant ${i+1}`} className="flex-1 p-2 bg-white border border-emerald-100 rounded-lg text-sm outline-emerald-500" />
                        {members.length > 1 && <button onClick={() => removeMember(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>}
                      </div>
                    ))}
                    {members.length < 6 && (
                      <button onClick={addMember} className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3"/> Ajouter un membre</button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4"/> Site et Antenne</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={metadata.antenne} onChange={e => setMetadata({...metadata, antenne: e.target.value})} placeholder="Antenne (ex: Korhogo)" className="w-full p-3 border rounded-xl text-sm" />
                      <input value={metadata.defensePlace} onChange={e => setMetadata({...metadata, defensePlace: e.target.value})} placeholder="Site d'étude (ex: CHR)" className="w-full p-3 border rounded-xl text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Info className="w-4 h-4"/> Variables de l'étude</label>
                    <input value={metadata.studyType} onChange={e => setMetadata({...metadata, studyType: e.target.value})} placeholder="Type d'étude" className="w-full p-3 border rounded-xl text-sm" />
                    <input value={metadata.population} onChange={e => setMetadata({...metadata, population: e.target.value})} placeholder="Population cible" className="w-full p-3 border rounded-xl text-sm" />
                    <input value={metadata.sampleSize} onChange={e => setMetadata({...metadata, sampleSize: e.target.value})} placeholder="Effectif (Taille échantillon)" className="w-full p-3 border rounded-xl text-sm" />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Thème du Mémoire</label>
                    <textarea value={theme} onChange={e => setTheme(e.target.value)} className="w-full h-32 p-4 border-2 border-emerald-50 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 font-bold uppercase text-emerald-950" placeholder="Entrez le thème exact..."></textarea>
                  </div>
                </div>
              </div>

              <button onClick={handleStartAnalysis} disabled={loading} className="w-full bg-emerald-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Wand2 className="w-6 h-6" />}
                Vérifier et Préparer la Rédaction
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-16 space-y-8 text-center bg-emerald-50/30">
              <div className="inline-flex p-6 bg-emerald-100 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-emerald-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">Validation Réussie</h3>
                <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Toutes les variables méthodologiques ont été vérifiées. L'IA va maintenant structurer le plan conforme à la 2ème partie (NOTRE ÉTUDE).
                </p>
              </div>
              <button onClick={handlePlan} className="w-full max-w-md bg-emerald-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-transform">Générer le Plan de Rédaction</button>
            </div>
          )}

          {step === 3 && (
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-end border-b pb-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Plan de Soutenance INFAS</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase">Conforme 2-1 & 2-2</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-emerald-200">
                {data.plan.map((p, i) => (
                  <div key={i} className={`p-4 border rounded-2xl flex gap-4 items-center transition-all ${p.includes("PARTIE") ? "bg-emerald-950 text-white border-emerald-950" : "bg-white text-slate-700 border-slate-100 shadow-sm"}`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${p.includes("PARTIE") ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"}`}>{i+1}</span>
                    <span className="text-[11px] font-black uppercase tracking-tight">{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={generateFullThesis} disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <ListChecks className="w-6 h-6" />}
                Lancer la Rédaction Automatisée
              </button>
            </div>
          )}

          {(step === 4 || (loading && step === 3)) && (
            <div className="flex flex-col h-[800px]">
              <div className="p-6 bg-emerald-950 text-white flex justify-between items-center border-b-4 border-emerald-500 shadow-xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase mb-1">Status: Rédaction Scientifique</span>
                  <span className="text-xs font-bold truncate max-w-md opacity-75 uppercase italic">{data.theme}</span>
                </div>
                {loading && (
                  <div className="flex items-center gap-3 bg-emerald-900/50 px-4 py-2 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">En cours...</span>
                  </div>
                )}
              </div>
              
              <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto space-y-12 bg-slate-50/50 custom-scrollbar">
                {data.sections.map((s, i) => (
                  <div key={s.id} className={`bg-white border-2 rounded-3xl shadow-lg transition-all duration-500 ${s.status === 'generating' ? 'border-emerald-500 ring-8 ring-emerald-500/10 scale-[1.02]' : 'border-slate-100'}`}>
                    <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Chapitre {i+1}</span>
                        <h3 className="font-black text-emerald-950 uppercase text-sm tracking-tight">{s.title}</h3>
                      </div>
                      {s.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : s.status === 'generating' ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : null}
                    </div>
                    <div className="p-10 text-[12px] text-slate-800 leading-[1.8] font-serif text-justify space-y-4">
                      {s.content ? (
                        s.content.split('\n').map((line, idx) => <p key={idx}>{line}</p>)
                      ) : (
                        <p className="italic text-slate-400 font-sans">
                          {s.status === 'generating' ? "Rédaction du contenu académique..." : "En attente du plan de travail