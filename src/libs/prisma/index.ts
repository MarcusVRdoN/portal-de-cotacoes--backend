import { PrismaClient, TipoUsuario, StatusCotacao } from '@prisma/client'

// const prisma = new PrismaClient()

// export default prisma

export { TipoUsuario, StatusCotacao }

declare global {
  var prisma: PrismaClient | undefined;
}

// Previne múltiplas instâncias em desenvolvimento
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Usa variável global para manter a mesma instância entre hot reloads
if (!global.prisma) {
  global.prisma = prismaClientSingleton();
}

export const prisma = global.prisma;

// Garantir que a conexão seja fechada quando o processo terminar
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}