
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ThesisSource, ThesisMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const PRO_MODEL = 'gemini-3-pro-preview';
const FAST_MODEL = 'gemini-3-flash-preview';

const INFAS_SYSTEM_PROMPT = `
TU ES UN ASSISTANT ACADÉMIQUE SPÉCIALISÉ DANS LA RÉDACTION DE MÉMOIRES INFAS (CÔTE D’IVOIRE).
TU DOIS APPLIQUER UNE MÉTHODE DE RÉDACTION ET DES ÉTAPES ACADÉMIQUES FIXES.

━━━━━━━━━━━━━━━━━━━━━━━
1. LOGIQUE GÉNÉRALE
━━━━━━━━━━━━━━━━━━━━━━━
- Mémoire COLLECTIF (5-6 personnes). Style académique, clair, scientifique.
- Présentation : Les grands titres (INTRODUCTION, DEDICACES, etc.) doivent être SEULS sur leur page.

━━━━━━━━━━━━━━━━━━━━━━━
2. STRUCTURE DE L’INTRODUCTION (ENTONNOIR OBLIGATOIRE)
━━━━━━━━━━━━━━━━━━━━━━━
Respecter l'ordre :
1. Annonce du problème
2. Monde -> Europe (France) -> Asie -> Afrique (Général + 2 pays) -> Côte d'Ivoire -> Local (Site).
3. Question de recherche, Objectif général, 3-4 Objectifs spécifiques (base pour questionnaire de 20 questions).

━━━━━━━━━━━━━━━━━━━━━━━
3. JUSTIFICATION DU CHOIX DU SUJET
━━━━━━━━━━━━━━━━━━━━━━━
Contenu obligatoire : Motivation personnelle, Pertinence scientifique, Pertinence sociale.

━━━━━━━━━━━━━━━━━━━━━━━
4. DEUXIEME PARTIE : NOTRE ETUDE (PLAN 2-1 FIXE)
━━━━━━━━━━━━━━━━━━━━━━━
2-1. MATERIEL ET METHODES
2-1-1. MATERIEL
2-1-1-1. SITE DE L’ETUDE (Milieu, Géo, Historique ville, Relief, Climat, Végétation, Hydrographie, Pop, Économie, Admin, Infrastructures).
2-1-1-2. CADRE DE L’ETUDE (Historique, Géo, Champ étude, Services).
2-1-1-3. POPULATION DE L’ETUDE
2-1-1-4. CRITERES DE SELECTION (Inclusion / Non inclusion)
2-1-2. METHODES (Type d’étude, Paramètres, Echantillonnage [Méthode, Technique, Taille], Collecte, Validation/Pré-test, Déroulement, Analyse, Éthique, Limites).
`;

export const verifyThesisInfo = async (theme: string, metadata: ThesisMetadata): Promise<{ isReady: boolean; missingInfo?: string }> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Analyse ces données pour un mémoire INFAS :
    Thème : ${theme}
    Site : ${metadata.defensePlace}
    Type d'étude : ${metadata.studyType}
    Population : ${metadata.population}
    Effectif : ${metadata.sampleSize}
    
    Vérifie s'il manque des informations essentielles pour commencer la rédaction selon le plan INFAS (Site, Type, Population, Effectif). 
    Réponds en JSON avec "isReady" (boolean) et "missingInfo" (string ou null).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isReady: { type: Type.BOOLEAN },
          missingInfo: { type: Type.STRING }
        },
        required: ["isReady"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"isReady": false, "missingInfo": "Erreur de validation"}');
  } catch {
    return { isReady: false, missingInfo: "Erreur lors de la validation des données." };
  }
};

export const searchSources = async (theme: string): Promise<{ text: string; sources: ThesisSource[] }> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Recherche des sources académiques réelles (OMS, Ministère de la Santé CI) pour : "${theme}".`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: ThesisSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

  return { text: response.text || "", sources };
};

export const generatePlan = async (): Promise<string[]> => {
  return [
    "DEDICACES", "REMERCIEMENTS", "SOMMAIRE", "LISTE DES ABREVIATIONS",
    "LISTE DES TABLEAUX", "LISTE DES GRAPHIQUES", "LISTE DES REPONSES OU QUESTIONS",
    "LISTE DES ANNEXES", "INTRODUCTION", "JUSTIFICATION DU CHOIX DU SUJET",
    "DEFINITION OPERATIONNELLE DES TERMES", "REVUE DE LA LITTERATURE",
    "DEUXIEME PARTIE : NOTRE ETUDE", "MATERIEL ET METHODES",
    "PRESENTATION DES RESULTATS", "DISCUSSION", "CONCLUSION",
    "RECOMMANDATIONS", "REFERENCES", "ANNEXES"
  ];
};

export const generateSectionContent = async (
  theme: string, 
  sectionTitle: string, 
  previousContent: string, 
  sources: ThesisSource[],
  metadata: ThesisMetadata
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `Rédige la section "${sectionTitle}" pour le mémoire INFAS :
    Thème : ${theme}
    Site : ${metadata.defensePlace} (EPHR/CHR/Centre de santé)
    Membres du groupe : ${metadata.groupMembers.join(', ')}
    Type d'étude : ${metadata.studyType}
    Population : ${metadata.population}
    Effectif : ${metadata.sampleSize}
    Antenne : ${metadata.antenne}
    
    Contexte précédent : ${previousContent.slice(-1000)}`,
    config: {
      systemInstruction: INFAS_SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });

  return response.text || "";
};
