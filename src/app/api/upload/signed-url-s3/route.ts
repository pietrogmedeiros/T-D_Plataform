import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Gerando URL assinada para upload direto no S3...');
    
    const body = await request.json();
    const { fileName, contentType, contentLength, userId } = body;

    if (!fileName || !contentType || !userId) {
      return NextResponse.json(
        { error: 'fileName, contentType e userId são obrigatórios' },
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

    try {
      // Gerar chave única para o arquivo
      const fileKey = S3Service.generateFileKey(fileName, userId);
      
      console.log('📁 Chave do arquivo S3:', fileKey);

      // Gerar URL assinada para upload
      const uploadUrl = await S3Service.getSignedUploadUrl(fileKey, contentType);

      console.log('✅ URL assinada gerada com sucesso');

      return NextResponse.json({
        success: true,
        uploadUrl,
        fileKey,
        fileName: fileKey.split('/').pop(),
        finalUrl: S3Service.getPublicUrl(fileKey),
        message: 'URL de upload gerada com sucesso',
      });

    } catch (storageError) {
      console.error('❌ Erro no S3:', storageError);
      return NextResponse.json(
        { error: 'Erro ao configurar upload no S3' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}