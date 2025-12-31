
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ThesisSource, ThesisMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

const INFAS_SYSTEM_PROMPT = `
TU ES L'ASSISTANT ACADÉMIQUE EXPERT POUR LA RÉDACTION DE MÉMOIRES INFAS (CÔTE D'IVOIRE).
TON OBJECTIF : PRODUIRE UN MÉMOIRE SCIENTIFIQUE COMPLET, RIGOUREUX ET CONFORME AU RÉFÉRENTIEL OFFICIEL INFAS.

━━━━━━━━━━━━━━━━━━━━━━━
1. STRUCTURE DE L'INTRODUCTION (10 POINTS - ORDRE STRICT)
━━━━━━━━━━━━━━━━━━━━━━━
Rédige l'introduction en suivant exactement cette progression :
1. Annonce du problème (définition et constat).
2. Situation du problème dans un univers vaste (concept global).
3. Mise en évidence de la gravité (irritation/impact santé publique).
4. Situation internationale (Europe, France, Asie - données factuelles).
5. Situation africaine (Généralités Afrique + focus sur DEUX pays spécifiques hors CI).
6. Situation nationale (Côte d’Ivoire - politiques nationales, PNDS, chiffres).
7. Situation locale (Le site exact de l'étude : ville, établissement, service).
8. Question de recherche (claire, précise et découlant du constat).
9. Objectif général (action globale de l'étude).
10. Trois (3) ou quatre (4) objectifs spécifiques (doivent être mesurables).

━━━━━━━━━━━━━━━━━━━━━━━
2. JUSTIFICATION DU CHOIX (3 PARTIES OBLIGATOIRES)
━━━━━━━━━━━━━━━━━━━━━━━
Structure obligatoirement sous ces trois sous-titres distincts :
- Motivation personnelle (intérêt du groupe pour le sujet).
- Pertinence scientifique (apport aux connaissances médicales/infirmières).
- Pertinence sociale (utilité pour la communauté et les patients).

━━━━━━━━━━━━━━━━━━━━━━━
3. DEUXIÈME PARTIE : NOTRE ÉTUDE
━━━━━━━━━━━━━━━━━━━━━━━
Détaille rigoureusement la méthodologie INFAS : Site et cadre, Population cible, Critères d'inclusion/exclusion, Type d'étude, Paramètres, Échantillonnage (taille et technique), Outils de collecte, Pré-test, Éthique, Limites.

━━━━━━━━━━━━━━━━━━━━━━━
4. RÈGLES DE RÉDACTION
━━━━━━━━━━━━━━━━━━━━━━━
- Style : Académique, impersonnel ("L'étude démontre...", "Il ressort de..."), scientifique.
- Titres : Toujours en MAJUSCULES.
- Questionnaire : L'annexe doit contenir un questionnaire structuré d'environ 20 questions découlant directement des objectifs spécifiques.
- Contexte : Toujours privilégier les réalités sanitaires et culturelles ivoiriennes.
`;

export const verifyThesisInfo = async (theme: string, metadata: ThesisMetadata): Promise<{ isReady: boolean; missingInfo?: string }> => {
  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: `Analyse la validité académique selon le canevas INFAS :
    Thème : ${theme}
    Site : ${metadata.defensePlace}
    Directeur : ${metadata.supervisor}
    Promotion : ${metadata.promotion}
    Antenne : ${metadata.antenne}
    
    Réponds en JSON avec "isReady" (boolean) et "missingInfo" (string).`,
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
    return JSON.parse(response.text || '{"isReady": false}');
  } catch {
    return { isReady: false, missingInfo: "Erreur d'analyse. Assurez-vous d'avoir rempli les champs obligatoires." };
  }
};

export const searchSources = async (theme: string): Promise<{ text: string; sources: ThesisSource[] }> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: `Recherche des sources officielles (OMS, UNICEF, Ministère Santé Côte d'Ivoire) et des données statistiques mondiales et africaines pour le thème : "${theme}".`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: ThesisSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

  return { text: response.text || "", sources };
};

export const generatePlan = async (): Promise<string[]> => {
  return [
    "DEDICACES",
    "REMERCIEMENTS",
    "SOMMAIRE",
    "LISTE DES ABREVIATIONS",
    "LISTE DES TABLEAUX ET FIGURES",
    "LISTE DES REPONSES ET QUESTIONS",
    "LISTE DES ANNEXES",
    "INTRODUCTION (LES 10 POINTS)",
    "JUSTIFICATION DU CHOIX DU SUJET (PERSONNEL, SCIENTIFIQUE, SOCIAL)",
    "DEFINITION OPERATIONNELLE DES TERMES",
    "PREMIERE PARTIE : REVUE DE LA LITTERATURE",
    "DEUXIEME PARTIE : NOTRE ETUDE (PHASE PRATIQUE)",
    "PRESENTATION DES RESULTATS",
    "DISCUSSION DES RESULTATS",
    "CONCLUSION",
    "RECOMMANDATIONS",
    "REFERENCES BIBLIOGRAPHIQUES",
    "ANNEXES (QUESTIONNAIRE DE 20 QUESTIONS)",
    "RESUME"
  ];
};

export const generateSectionContent = async (
  theme: string, 
  sectionTitle: string, 
  previousContent: string, 
  sources: ThesisSource[],
  metadata: ThesisMetadata
): Promise<string> => {
  const sourceContext = sources.map(s => `- ${s.title}: ${s.uri}`).join('\n');
  const studentsList = metadata.students.map(s => `${s.name} (Matricule: ${s.matricule})`).join(', ');
  
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `
    RÉDIGE LE CHAPITRE : ${sectionTitle.toUpperCase()}
    
    PARAMÈTRES DU MÉMOIRE :
    Thème : ${theme}
    Site : ${metadata.defensePlace}
    Antenne : ${metadata.antenne}
    Promotion : ${metadata.promotion}
    Groupe N° : ${metadata.groupNumber}
    Étudiants : ${studentsList}
    Directeur : ${metadata.supervisor}
    
    EXIGENCES :
    - Si INTRODUCTION : Développer obligatoirement les 10 points (Mondial -> Afrique -> CI -> Local -> Question -> Objectifs).
    - Si JUSTIFICATION : Diviser en Motivation Personnelle, Pertinence Scientifique et Pertinence Sociale.
    - Si NOTRE ETUDE : Détailler population, échantillonnage, pré-test et éthique selon le canevas INFAS.
    - Si ANNEXES : Créer un questionnaire complet d'environ 20 questions numérotées.
    
    SOURCES À INTÉGRER :
    ${sourceContext}
    
    HISTORIQUE DE RÉDACTION (pour cohérence) :
    ${previousContent.slice(-2000)}
    `,
    config: {
      systemInstruction: INFAS_SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 15000 }
    }
  });

  return response.text || "Erreur lors de la génération du contenu scientifique.";
};
