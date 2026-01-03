
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ThesisSource, ThesisMetadata, DeducedLogic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

const INFAS_SYSTEM_PROMPT = `
TU ES L'ASSISTANT ACADÉMIQUE EXPERT POUR LA RÉDACTION DE MÉMOIRES INFAS (CÔTE D'IVOIRE).
RÈGLE D'OR : LE THÈME EST LE CŒUR ABSOLU. TOUT DÉCOULE DU THÈME.

━━━━━━━━━━━━━━━━━━━━━━━
INTERDICTION STRICTE DE FORMATAGE :
- NE JAMAIS UTILISER DE SYMBOLES DE MISE EN FORME MARKDOWN.
- AUCUN ASTÉRISQUE (*), AUCUN DIÈSE (#), AUCUN DOUBLE ASTÉRISQUE (**) POUR LE GRAS.
- LE TEXTE DOIT ÊTRE BRUT, PROPRE ET PRÊT POUR UNE MISE EN PAGE WORD/PDF.
- UTILISE UNIQUEMENT DES RETOURS À LA LIGNE POUR SÉPARER LES PARAGRAPHES.
━━━━━━━━━━━━━━━━━━━━━━━

1. DÉDUCTION SCIENTIFIQUE À PARTIR DU THÈME
À partir du thème fourni, tu dois être capable d'identifier et de générer :
- LA QUESTION DE RECHERCHE : Une question centrale ouverte.
- L'OBJECTIF GÉNÉRAL : La transformation directe du thème en action.
- LES OBJECTIFS SPÉCIFIQUES : La décomposition logique du thème.

2. STRUCTURE DE L'INTRODUCTION (RÉFÉRENTIEL INFAS 2024)
Respecte strictement cet ordre sans utiliser de titres de sous-sections Markdown :
1. Définition / Annonce du problème.
2. Contexte OMS.
3. Gravité.
4. Contexte Pays Développés.
5. Contexte Afrique de l'Ouest.
6. Contexte Côte d'Ivoire.
7. Constat de terrain local.
8. QUESTION DE RECHERCHE.
9. OBJECTIF GÉNÉRAL.
10. OBJECTIFS SPÉCIFIQUES.

3. RÈGLES DE RÉDACTION SCIENTIFIQUE
- Style neutre et impersonnel.
- Citations format Vancouver.
- Ancrage systématique en Côte d'Ivoire.
`;

const cleanMarkdown = (text: string): string => {
  // Supprime les astérisques, les dièses et les backticks
  return text.replace(/[*#`]/g, '').trim();
};

export const verifyThesisInfo = async (theme: string, metadata: ThesisMetadata): Promise<{ isReady: boolean; missingInfo?: string; deducedLogic?: DeducedLogic }> => {
  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: `Analyse ce thème pour un mémoire INFAS : "${theme}". 
    À partir de ce thème UNIQUEMENT, extrais la Question de Recherche, l'Objectif Général et 3 Objectifs Spécifiques.
    Vérifie aussi si le Site (${metadata.defensePlace}) et le Directeur (${metadata.supervisor}) sont valides.
    IMPORTANT: Aucun symbole * ou # dans les textes retournés.
    
    Réponds en JSON stricte.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isReady: { type: Type.BOOLEAN },
          missingInfo: { type: Type.STRING },
          deducedLogic: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              objectiveGeneral: { type: Type.STRING },
              objectivesSpecific: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["question", "objectiveGeneral", "objectivesSpecific"]
          }
        },
        required: ["isReady"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{"isReady": false}');
    if (data.deducedLogic) {
      data.deducedLogic.question = cleanMarkdown(data.deducedLogic.question);
      data.deducedLogic.objectiveGeneral = cleanMarkdown(data.deducedLogic.objectiveGeneral);
      data.deducedLogic.objectivesSpecific = data.deducedLogic.objectivesSpecific.map(cleanMarkdown);
    }
    return data;
  } catch {
    return { isReady: false, missingInfo: "Analyse du thème impossible." };
  }
};

export const searchSources = async (theme: string): Promise<{ text: string; sources: ThesisSource[] }> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: `Données scientifiques et statistiques officielles relatives au thème : "${theme}". Focus Côte d'Ivoire. Aucun symbole Markdown dans le texte.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: ThesisSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

  return { text: cleanMarkdown(response.text || ""), sources };
};

export const generatePlan = async (): Promise<string[]> => {
  return [
    "DEDICACES",
    "REMERCIEMENTS",
    "SOMMAIRE",
    "LISTE DES ABREVIATIONS",
    "LISTE DES TABLEAUX ET FIGURES",
    "INTRODUCTION (QUESTION, OBJECTIF GÉNÉRAL, OBJECTIFS SPÉCIFIQUES)",
    "JUSTIFICATION DU CHOIX DU SUJET",
    "DEFINITION OPERATIONNELLE DES TERMES",
    "PREMIERE PARTIE : REVUE DE LA LITTERATURE",
    "DEUXIEME PARTIE : CADRE ET METHODOLOGIE DE L'ETUDE",
    "PRESENTATION DES RESULTATS",
    "DISCUSSION DES RESULTATS",
    "CONCLUSION",
    "RECOMMANDATIONS",
    "REFERENCES BIBLIOGRAPHIQUES (VANCOUVER)",
    "ANNEXES (OUTIL DE COLLECTE)",
    "RESUME"
  ];
};

export const generateSectionContent = async (
  theme: string, 
  sectionTitle: string, 
  previousContent: string, 
  sources: ThesisSource[],
  metadata: ThesisMetadata,
  deducedLogic?: DeducedLogic
): Promise<string> => {
  const sourceContext = sources.map(s => `- ${s.title}: ${s.uri}`).join('\n');
  const logicContext = deducedLogic ? `
  LOGIQUE SCIENTIFIQUE DÉDUITE :
  - Question de Recherche : ${deducedLogic.question}
  - Objectif Général : ${deducedLogic.objectiveGeneral}
  - Objectifs Spécifiques : ${deducedLogic.objectivesSpecific.join('; ')}
  ` : '';
  
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `
    RÉDACTION SCIENTIFIQUE DU CHAPITRE : ${sectionTitle.toUpperCase()}
    
    THÈME CENTRAL : ${theme}
    ${logicContext}
    
    INSTRUCTION CRUCIALE : NE JAMAIS UTILISER DE MISE EN FORME MARKDOWN (PAS D'ASTÉRISQUES *, PAS DE DIÈSES #).
    
    CONTEXTE ADDITIONNEL :
    - Site : ${metadata.defensePlace}
    - Population : ${metadata.population}
    
    SOURCES :
    ${sourceContext}
    
    HISTORIQUE :
    ${previousContent.slice(-2500)}
    `,
    config: {
      systemInstruction: INFAS_SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 15000 }
    }
  });

  return cleanMarkdown(response.text || "Erreur lors de la génération.");
};
