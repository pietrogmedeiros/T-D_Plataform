import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload de vídeo...');
    
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

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    console.log('💾 Processando arquivo:', fileName);
    
    // Para o App Engine, vamos usar o Cloud Storage ou salvar localmente
    try {
      const filePath = join(process.cwd(), 'public', 'uploads', 'videos', fileName);

      // Converter o arquivo para buffer e salvar
      console.log('🔄 Convertendo arquivo para buffer...');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      console.log('💾 Salvando arquivo no sistema...');
      await writeFile(filePath, buffer);
    } catch (writeError) {
      console.error('❌ Erro ao salvar arquivo:', writeError);
      throw new Error('Erro ao salvar arquivo no servidor');
    }

    // Retornar as URLs
    const videoUrl = `/uploads/videos/${fileName}`;
    const videoPath = `uploads/videos/${fileName}`;

    console.log('✅ Arquivo salvo:', {
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

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
