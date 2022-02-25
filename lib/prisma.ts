import { PrismaClient } from '@prisma/client'

/* @ts-ignore */
const prisma = global.prisma || new PrismaClient();

/* @ts-ignore */
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma