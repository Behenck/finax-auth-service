import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { auth } from "@/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function getUsers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/users",
      {
        schema: {
          tags: ["users"],
          summary: "Get users.",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              users: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                  createdAt: z.string().datetime(),
                })
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        });

        const serializedUsers = users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(), // <- conversão correta
        }))

        return reply.send({ users: serializedUsers });
      }
    );
}
