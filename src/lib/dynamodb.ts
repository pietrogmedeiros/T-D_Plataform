import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamodb = DynamoDBDocumentClient.from(client);

// Nomes das tabelas
// Interfaces
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  videoPath?: string;
  uploaderId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  learningObjective1?: string;
  learningObjective2?: string;
  learningObjective3?: string;
  learningObjective4?: string;
  createdAt: string;
  updatedAt: string;
}

export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'plataforma-ted-users',
  TRAININGS: process.env.DYNAMODB_TRAININGS_TABLE || 'plataforma-ted-trainings',
  USER_PROGRESS: process.env.DYNAMODB_USER_PROGRESS_TABLE || 'plataforma-ted-user-progress',
  TRAINING_RATINGS: process.env.DYNAMODB_TRAINING_RATINGS_TABLE || 'plataforma-ted-training-ratings',
};

// Utilitários para operações DynamoDB
export class DynamoDBService {
  // Usuários
  static async createUser(user: User) {
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return await dynamodb.send(command);
  }

  static async getUserByEmail(email: string) {
    const command = new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });
    const result = await dynamodb.send(command);
    return result.Items?.[0] || null;
  }

  static async getUserById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id },
    });
    const result = await dynamodb.send(command);
    return result.Item || null;
  }

  static async getAllUsers() {
    const command = new ScanCommand({
      TableName: TABLES.USERS,
    });
    const result = await dynamodb.send(command);
    return result.Items || [];
  }

  // Treinamentos
  static async createTraining(training: Training) {
    const command = new PutCommand({
      TableName: TABLES.TRAININGS,
      Item: {
        ...training,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return await dynamodb.send(command);
  }

  static async getTrainingById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.TRAININGS,
      Key: { id },
    });
    const result = await dynamodb.send(command);
    return result.Item || null;
  }

  static async getAllTrainings() {
    const command = new ScanCommand({
      TableName: TABLES.TRAININGS,
    });
    const result = await dynamodb.send(command);
    return result.Items || [];
  }

  static async getTrainingsByUploader(uploaderId: string) {
    const command = new ScanCommand({
      TableName: TABLES.TRAININGS,
      FilterExpression: 'uploaderId = :uploaderId',
      ExpressionAttributeValues: {
        ':uploaderId': uploaderId,
      },
    });
    const result = await dynamodb.send(command);
    return result.Items || [];
  }

  static async updateTraining(id: string, updates: Record<string, unknown>) {
    const command = new UpdateCommand({
      TableName: TABLES.TRAININGS,
      Key: { id },
      UpdateExpression: 'SET #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
        ...Object.keys(updates).reduce((acc, key) => {
          acc[`:${key}`] = updates[key];
          return acc;
        }, {} as Record<string, unknown>),
      },
    });
    return await dynamodb.send(command);
  }

  // Progresso do usuário
  static async getUserProgress(userId: string, trainingId: string) {
    const command = new GetCommand({
      TableName: TABLES.USER_PROGRESS,
      Key: { 
        id: `${userId}#${trainingId}`,
        userId,
        trainingId 
      },
    });
    const result = await dynamodb.send(command);
    return result.Item || null;
  }

  static async updateUserProgress(userId: string, trainingId: string, progress: number, completed: boolean = false) {
    const command = new PutCommand({
      TableName: TABLES.USER_PROGRESS,
      Item: {
        id: `${userId}#${trainingId}`,
        userId,
        trainingId,
        progress,
        completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return await dynamodb.send(command);
  }

  static async getUserProgressByUser(userId: string) {
    const command = new ScanCommand({
      TableName: TABLES.USER_PROGRESS,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
    const result = await dynamodb.send(command);
    return result.Items || [];
  }

  // Avaliações de treinamento
  static async createOrUpdateRating(userId: string, trainingId: string, rating: number) {
    const command = new PutCommand({
      TableName: TABLES.TRAINING_RATINGS,
      Item: {
        id: `${userId}#${trainingId}`,
        userId,
        trainingId,
        rating,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return await dynamodb.send(command);
  }

  static async getTrainingRatings(trainingId: string) {
    const command = new ScanCommand({
      TableName: TABLES.TRAINING_RATINGS,
      FilterExpression: 'trainingId = :trainingId',
      ExpressionAttributeValues: {
        ':trainingId': trainingId,
      },
    });
    const result = await dynamodb.send(command);
    return result.Items || [];
  }
}