// Firebase configuration - atualmente não utilizado na produção
// A aplicação usa PostgreSQL como banco principal

// Placeholders para compatibilidade com código existente
export const auth = null;
export const db = null;
export const storage = null;

// Flag para indicar que Firebase não está configurado
export const isFirebaseConfigured = false;

console.log('Firebase não está configurado. Usando PostgreSQL como banco principal.');
