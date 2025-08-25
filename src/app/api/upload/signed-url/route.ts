import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

const storage = new Storage({
  projectId: 'ted-webcontinental',
});

const bucketName = 'ted-webcontinental-videos';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Gerando URL assinada para upload direto...');
    
    const body = await request.json();
    const { fileName, contentType, contentLength } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName e contentType são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!contentType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de vídeo são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (1GB máximo)
    if (contentLength && contentLength > 1024 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 1GB' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `videos/${timestamp}_${sanitizedFileName}`;
    
    console.log('📁 Nome do arquivo:', finalFileName);

    try {
      const bucket = storage.bucket(bucketName);
      
      // Verificar se o bucket existe
      const [exists] = await bucket.exists();
      if (!exists) {
        console.log('❌ Bucket não existe:', bucketName);
        return NextResponse.json(
          { error: 'Bucket de armazenamento não configurado' },
          { status: 500 }
        );
      }

      const file = bucket.file(finalFileName);
      
      // Gerar URL assinada para upload (válida por 1 hora)
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 60 * 60 * 1000, // 1 hora
        contentType: contentType,
        extensionHeaders: {
          'x-goog-acl': 'public-read', // Tornar público automaticamente
        },
      });

      console.log('✅ URL assinada gerada');

      return NextResponse.json({
        uploadUrl: url,
        fileName: finalFileName,
        publicUrl: `https://storage.googleapis.com/${bucketName}/${finalFileName}`,
      });

    } catch (storageError) {
      console.error('❌ Erro no Cloud Storage:', storageError);
      return NextResponse.json(
        { error: 'Erro ao configurar upload' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erro ao gerar URL assinada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
