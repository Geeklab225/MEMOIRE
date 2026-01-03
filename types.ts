
export interface ThesisSource {
  title: string;
  uri: string;
}

export interface ThesisSection {
  id: string;
  title: string;
  content: string;
  status: 'idle' | 'generating' | 'completed';
}

export interface Student {
  name: string;
  matricule: string;
}

export interface DeducedLogic {
  question: string;
  objectiveGeneral: string;
  objectivesSpecific: string[];
}

export interface ThesisMetadata {
  author: string;
  groupNumber: string;
  students: Student[];
  speciality: string;
  option: string;
  promotion: string;
  academicYear: string;
  antenne: string;
  defenseDate: string;
  defensePlace: string;
  juryPresident: string;
  juryAssessor: string;
  supervisor: string;
  supervisorTitle: string;
  studyType: string;
  population: string;
  sampleSize: string;
}

export interface ThesisData {
  theme: string;
  metadata: ThesisMetadata;
  sources: ThesisSource[];
  plan: string[];
  sections: ThesisSection[];
  deducedLogic?: DeducedLogic;
}
