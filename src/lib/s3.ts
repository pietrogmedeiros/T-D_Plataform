import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME || 'plataforma-ted-webcontinental-uploads';

export class S3Service {
  // Gerar URL assinada para upload
  static async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Metadata: {
        'uploaded-by': 'plataforma-ted',
      },
      Tagging: 'awsApplication=arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal',
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hora
  }

  // Gerar URL assinada para download
  static async getSignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hora
  }

  // Upload direto de arquivo
  static async uploadFile(key: string, body: Buffer | Uint8Array | string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: {
        'uploaded-by': 'plataforma-ted',
      },
      Tagging: 'awsApplication=arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal',
    });

    return await s3Client.send(command);
  }

  // Deletar arquivo
  static async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    return await s3Client.send(command);
  }

  // Gerar chave única para arquivo
  static generateFileKey(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `uploads/${userId}/${timestamp}_${sanitizedName}`;
  }

  // Gerar URL público (para arquivos públicos)
  static getPublicUrl(key: string): string {
    return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`;
  }
}