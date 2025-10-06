import { DynamoDBService } from '../src/lib/dynamodb.js';

const seedData = async () => {
  console.log('🌱 Iniciando seed do DynamoDB...');

  try {
    // Criar usuário administrador
    const adminUser = {
      id: crypto.randomUUID(),
      email: 'pietro.medeiros@webcontinental.com.br',
      displayName: 'Pietro Medeiros',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createUser(adminUser);
    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar usuário de teste
    const testUser = {
      id: crypto.randomUUID(),
      email: 'usuario@test.com',
      displayName: 'Usuário Teste',
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createUser(testUser);
    console.log('✅ Usuário teste criado:', testUser.email);

    // Criar treinamentos de exemplo
    const training1 = {
      id: crypto.randomUUID(),
      title: 'Introdução à Segurança no Trabalho',
      description: 'Curso básico sobre práticas de segurança e prevenção de acidentes no ambiente de trabalho.',
      uploaderId: adminUser.id,
      status: 'PUBLISHED',
      learningObjective1: 'Identificar riscos no ambiente de trabalho',
      learningObjective2: 'Aplicar práticas de segurança básicas',
      learningObjective3: 'Usar equipamentos de proteção individual',
      learningObjective4: 'Reportar incidentes de segurança',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createTraining(training1);
    console.log('✅ Treinamento criado:', training1.title);

    const training2 = {
      id: crypto.randomUUID(),
      title: 'Compliance e Ética Empresarial',
      description: 'Treinamento sobre compliance, ética empresarial e boas práticas de governança corporativa.',
      uploaderId: adminUser.id,
      status: 'PUBLISHED',
      learningObjective1: 'Compreender princípios de compliance',
      learningObjective2: 'Aplicar código de ética empresarial',
      learningObjective3: 'Identificar conflitos de interesse',
      learningObjective4: 'Reportar irregularidades',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createTraining(training2);
    console.log('✅ Treinamento criado:', training2.title);

    const training3 = {
      id: crypto.randomUUID(),
      title: 'Desenvolvimento de Habilidades Interpessoais',
      description: 'Curso focado no desenvolvimento de soft skills e habilidades de comunicação e liderança.',
      uploaderId: adminUser.id,
      status: 'DRAFT',
      learningObjective1: 'Melhorar comunicação interpessoal',
      learningObjective2: 'Desenvolver habilidades de liderança',
      learningObjective3: 'Gerenciar conflitos efetivamente',
      learningObjective4: 'Trabalhar em equipe colaborativamente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.createTraining(training3);
    console.log('✅ Treinamento criado:', training3.title);

    console.log('🎉 Seed concluído com sucesso!');
    console.log('');
    console.log('📋 Dados criados:');
    console.log('- 2 usuários (1 admin, 1 test)');
    console.log('- 3 treinamentos (2 publicados, 1 rascunho)');
    console.log('');
    console.log('🔑 Login de teste:');
    console.log('Email: pietro.medeiros@webcontinental.com.br');
    console.log('Senha: qualquer (modo de desenvolvimento)');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
};

// Executar seed
seedData();