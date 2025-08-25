import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

export interface Training {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoPath?: string; // Caminho do arquivo de vídeo
  uploaderId: string;
  createdAt: Timestamp;
  learningObjective1?: string;
  learningObjective2?: string;
  learningObjective3?: string;
  learningObjective4?: string;
}

export interface Rating {
  userId: string;
  score: number;
  comment?: string;
}

export interface CreateTrainingData {
  title: string;
  description: string;
  video: File;
}

export interface CreateUserData {
  email: string;
  role: 'admin' | 'user';
  displayName: string;
}
