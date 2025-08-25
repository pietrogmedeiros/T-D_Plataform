import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

// Configurar Cloud Storage
const storage = new Storage({
  projectId: 'ted-webcontinental',
});

const bucketName = 'ted-webcontinental-videos';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload de vídeo para Cloud Storage...');
    
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      console.log('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    console.log('📄 Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      console.log('❌ Tipo de arquivo inválido:', file.type);
      return NextResponse.json(
        { error: 'Apenas arquivos de vídeo são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (1GB máximo para Cloud Storage)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      console.log('❌ Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 1GB' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `videos/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    console.log('☁️ Fazendo upload para Cloud Storage:', fileName);
    
    try {
      // Obter ou criar bucket
      const bucket = storage.bucket(bucketName);
      
      // Verificar se o bucket existe, se não, criar
      try {
        const [exists] = await bucket.exists();
        if (!exists) {
          console.log('🪣 Criando bucket:', bucketName);
          await storage.createBucket(bucketName, {
            location: 'US-CENTRAL1',
            storageClass: 'STANDARD',
          });
        }
      } catch (bucketError) {
        console.log('ℹ️ Bucket já existe ou erro ao verificar:', bucketError instanceof Error ? bucketError.message : 'Erro desconhecido');
      }

      // Converter arquivo para buffer
      console.log('🔄 Convertendo arquivo para buffer...');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Fazer upload para o Cloud Storage
      const fileUpload = bucket.file(fileName);
      
      console.log('☁️ Enviando para Cloud Storage...');
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.type,
        },
        resumable: true, // Para uploads grandes e mais confiáveis
        validation: 'md5',
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('❌ Erro no stream de upload:', error);
          reject(error);
        });

        stream.on('finish', () => {
          console.log('✅ Stream finalizado');
          resolve();
        });

        stream.end(buffer);
      });
      
      // Tornar o arquivo público
      await fileUpload.makePublic();
      
      console.log('✅ Upload concluído para Cloud Storage');
      
      // URLs do arquivo
      const videoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      const videoPath = fileName;

      console.log('✅ Arquivo salvo no Cloud Storage:', {
        fileName,
        size: file.size,
        type: file.type,
        videoUrl,
        videoPath
      });

      return NextResponse.json({
        success: true,
        videoUrl,
        videoPath,
        fileName,
        size: file.size,
        type: file.type
      });
      
    } catch (storageError) {
      console.error('❌ Erro no Cloud Storage:', storageError);
      throw new Error('Erro ao fazer upload para Cloud Storage');
    }

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
