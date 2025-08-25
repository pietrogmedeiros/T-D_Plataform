import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const dynamic = 'force-dynamic';

const storage = new Storage({
  projectId: 'ted-webcontinental',
});

const bucketName = 'ted-webcontinental-videos';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando upload resumable...');
    
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const chunkIndex = formData.get('chunkIndex') as string;
    const totalChunks = formData.get('totalChunks') as string;
    const fileName = formData.get('fileName') as string;

    if (!file || !chunkIndex || !totalChunks || !fileName) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: video, chunkIndex, totalChunks, fileName' },
        { status: 400 }
      );
    }

    const chunkIdx = parseInt(chunkIndex);
    const totalChks = parseInt(totalChunks);

    console.log(`📦 Chunk ${chunkIdx + 1}/${totalChks} do arquivo ${fileName}`);

    // Gerar nome único para o arquivo final
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `videos/${timestamp}_${sanitizedFileName}`;

    try {
      const bucket = storage.bucket(bucketName);
      
      // Para o primeiro chunk, criar um novo arquivo
      if (chunkIdx === 0) {
        console.log('🆕 Criando novo arquivo para upload');
        // Armazenar metadados temporários se necessário
      }

      // Converter chunk para buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Nome temporário para os chunks
      const tempFileName = `temp_chunks/${finalFileName}_chunk_${chunkIdx}`;
      const tempFile = bucket.file(tempFileName);

      // Salvar o chunk temporário
      await tempFile.save(buffer, {
        metadata: {
          contentType: 'application/octet-stream',
        },
      });

      console.log(`✅ Chunk ${chunkIdx + 1} salvo`);

      // Se é o último chunk, juntar todos
      if (chunkIdx === totalChks - 1) {
        console.log('🔗 Juntando todos os chunks...');
        
        // Criar arquivo final
        const finalFile = bucket.file(finalFileName);
        const writeStream = finalFile.createWriteStream({
          metadata: {
            contentType: 'video/mp4', // Assumindo MP4, ajustar conforme necessário
          },
        });

        // Ler e juntar todos os chunks em ordem
        for (let i = 0; i < totalChks; i++) {
          const chunkFileName = `temp_chunks/${finalFileName}_chunk_${i}`;
          const chunkFile = bucket.file(chunkFileName);
          const [chunkData] = await chunkFile.download();
          writeStream.write(chunkData);
        }

        await new Promise<void>((resolve, reject) => {
          writeStream.on('error', reject);
          writeStream.on('finish', resolve);
          writeStream.end();
        });

        // Tornar público
        await finalFile.makePublic();

        // Limpar chunks temporários
        console.log('🧹 Limpando chunks temporários...');
        for (let i = 0; i < totalChks; i++) {
          const chunkFileName = `temp_chunks/${finalFileName}_chunk_${i}`;
          const chunkFile = bucket.file(chunkFileName);
          await chunkFile.delete().catch(() => {
            // Ignorar erro se já foi deletado
          });
        }

        const videoUrl = `https://storage.googleapis.com/${bucketName}/${finalFileName}`;
        
        console.log('✅ Upload completo:', videoUrl);

        return NextResponse.json({
          success: true,
          completed: true,
          videoUrl,
          videoPath: finalFileName,
          fileName: finalFileName,
        });
      }

      // Chunk intermediário salvo com sucesso
      return NextResponse.json({
        success: true,
        completed: false,
        chunkIndex: chunkIdx,
        message: `Chunk ${chunkIdx + 1}/${totalChks} processado`,
      });

    } catch (storageError) {
      console.error('❌ Erro no Cloud Storage:', storageError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload para Cloud Storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erro no upload por chunks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
