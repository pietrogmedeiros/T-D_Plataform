import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProduction() {
  console.log('🌱 Populando banco de dados de produção...');

  try {
    // Criar usuário administrador
    const adminUser = await prisma.user.upsert({
      where: { email: 'pietro.medeiros@webcontinental.com.br' },
      update: {},
      create: {
        id: 'pietro-admin-user',
        email: 'pietro.medeiros@webcontinental.com.br',
        displayName: 'Pietro Medeiros',
        role: 'ADMIN',
      },
    });

    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar usuário admin adicional
    const adminUser2 = await prisma.user.upsert({
      where: { email: 'admin@webcontinental.com.br' },
      update: {},
      create: {
        id: 'admin-user-1',
        email: 'admin@webcontinental.com.br',
        displayName: 'Administrador',
        role: 'ADMIN',
      },
    });

    console.log('✅ Usuário admin adicional criado:', adminUser2.email);

    // Criar usuário de teste
    const testUser = await prisma.user.upsert({
      where: { email: 'usuario@webcontinental.com.br' },
      update: {},
      create: {
        id: 'test-user-1',
        email: 'usuario@webcontinental.com.br',
        displayName: 'Usuário Teste',
        role: 'USER',
      },
    });

    console.log('✅ Usuário teste criado:', testUser.email);

    // Criar treinamento de exemplo com objetivos de aprendizado
    const training1 = await prisma.training.upsert({
      where: { id: 'training-seguranca-trabalho' },
      update: {},
      create: {
        id: 'training-seguranca-trabalho',
        title: 'Segurança do Trabalho - Fundamentos',
        description: `
          <p>Treinamento completo sobre <strong>segurança do trabalho</strong> para o ambiente corporativo.</p>
          <h3>Módulos do Treinamento:</h3>
          <ul>
            <li>Normas regulamentadoras (NRs)</li>
            <li>Equipamentos de Proteção Individual (EPIs)</li>
            <li>Equipamentos de Proteção Coletiva (EPCs)</li>
            <li>Prevenção de acidentes</li>
            <li>Procedimentos de emergência</li>
          </ul>
          <p>Este treinamento é <em>essencial</em> para todos os colaboradores da empresa.</p>
        `,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        uploaderId: adminUser2.id,
        status: 'PUBLISHED',
        learningObjective1: 'Compreender as principais normas regulamentadoras',
        learningObjective2: 'Aprender o uso correto de EPIs e EPCs',
        learningObjective3: 'Desenvolver técnicas de prevenção de acidentes',
        learningObjective4: 'Dominar procedimentos de emergência',
      },
    });

    console.log('✅ Treinamento 1 criado:', training1.title);

    // Criar segundo treinamento
    const training2 = await prisma.training.upsert({
      where: { id: 'training-lideranca-equipes' },
      update: {},
      create: {
        id: 'training-lideranca-equipes',
        title: 'Liderança e Gestão de Equipes',
        description: `
          <p>Desenvolva suas habilidades de <strong>liderança</strong> e aprenda a gerenciar equipes eficazmente.</p>
          <h3>Conteúdo Programático:</h3>
          <ol>
            <li>Fundamentos da liderança moderna</li>
            <li>Comunicação assertiva e feedback</li>
            <li>Gestão de conflitos e mediação</li>
            <li>Motivação e engajamento de equipes</li>
            <li>Delegação eficaz e empowerment</li>
          </ol>
          <p>Ideal para <em>gestores</em> e <em>líderes</em> em desenvolvimento.</p>
        `,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        uploaderId: adminUser2.id,
        status: 'PUBLISHED',
        learningObjective1: 'Desenvolver habilidades de liderança moderna',
        learningObjective2: 'Aprimorar técnicas de comunicação assertiva',
        learningObjective3: 'Gerenciar conflitos de forma eficaz',
        learningObjective4: 'Motivar e engajar equipes de trabalho',
      },
    });

    console.log('✅ Treinamento 2 criado:', training2.title);

    // Criar terceiro treinamento
    const training3 = await prisma.training.upsert({
      where: { id: 'training-compliance-etica' },
      update: {},
      create: {
        id: 'training-compliance-etica',
        title: 'Compliance e Ética Empresarial',
        description: `
          <p>Treinamento sobre <strong>compliance</strong> e <strong>ética empresarial</strong> para uma cultura organizacional sólida.</p>
          <h3>Tópicos Abordados:</h3>
          <ul>
            <li>Conceitos fundamentais de compliance</li>
            <li>Código de ética da empresa</li>
            <li>Prevenção à corrupção e lavagem de dinheiro</li>
            <li>LGPD e proteção de dados</li>
            <li>Canal de denúncias e investigações</li>
          </ul>
          <p><strong>Importante:</strong> Treinamento obrigatório para todos os colaboradores.</p>
        `,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        uploaderId: adminUser2.id,
        status: 'PUBLISHED',
        learningObjective1: 'Entender os fundamentos do compliance',
        learningObjective2: 'Aplicar o código de ética empresarial',
        learningObjective3: 'Prevenir práticas de corrupção',
        learningObjective4: 'Proteger dados pessoais conforme LGPD',
      },
    });

    console.log('✅ Treinamento 3 criado:', training3.title);

    console.log('');
    console.log('🎉 Seed de produção concluído com sucesso!');
    console.log('');
    console.log('👥 Usuários criados:');
    console.log('  - pietro.medeiros@webcontinental.com.br (ADMIN)');
    console.log('  - admin@webcontinental.com.br (ADMIN)');
    console.log('  - usuario@webcontinental.com.br (USER)');
    console.log('');
    console.log('📚 Treinamentos criados:');
    console.log('  - Segurança do Trabalho - Fundamentos');
    console.log('  - Liderança e Gestão de Equipes');
    console.log('  - Compliance e Ética Empresarial');
    console.log('');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProduction();
}

export default seedProduction;
