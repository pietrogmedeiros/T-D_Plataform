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
  uploaderId: string;
  createdAt: Timestamp;
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
