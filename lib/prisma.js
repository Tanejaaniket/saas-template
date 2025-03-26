import { PrismaClient } from "@prisma/client";

//* This file ensures that only one connection is made by a client with the database. if the connection already exsists then other connection should not be formed.
const prismaSingleton = () => {
  return new PrismaClient();
}

//*Reference to the global object
const globalForPrisma = globalThis;

const prisma = globalForPrisma?.prisma || prismaSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;