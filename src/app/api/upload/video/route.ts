import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 API Upload Video: Iniciando upload...');
    console.log('📤 Environment check:', {
      AWS_REGION: process.env.AWS_REGION,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    
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

    // Validar tamanho (500MB máximo)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('❌ Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 500MB' },
        { status: 400 }
      );
    }

    // Gerar chave única para o arquivo S3
    const userId = 'admin'; // Pode vir do token JWT depois
    const fileKey = S3Service.generateFileKey(file.name, userId);
    
    console.log('� Chave do arquivo S3:', fileKey);
    
    // Converter o arquivo para buffer
    console.log('🔄 Convertendo arquivo para buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload para S3
    console.log('☁️ Enviando para S3...');
    console.log('☁️ S3 Config:', {
      bucket: process.env.S3_BUCKET_NAME || 'plataforma-ted-webcontinental-uploads',
      keyPath: fileKey
    });
    
    try {
      const uploadResult = await S3Service.uploadFile(fileKey, buffer, file.type);
      console.log('✅ S3 Upload Result:', uploadResult);
      
      // Gerar URL pública do arquivo
      const videoUrl = S3Service.getPublicUrl(fileKey);
      
      console.log('✅ Arquivo enviado para S3:', videoUrl);
      
      // Retornar as URLs
      const videoPath = fileKey;

      return NextResponse.json({
        success: true,
        videoUrl,
        videoPath,
        fileName: file.name,
        size: file.size,
        type: file.type,
        s3Key: fileKey
      });
    } catch (s3Error) {
      console.error('❌ Erro ao enviar para S3:', s3Error);
      throw new Error('Erro ao enviar arquivo para S3');
    }

  } catch (error) {
    console.error('❌ Erro no upload detalhado:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
