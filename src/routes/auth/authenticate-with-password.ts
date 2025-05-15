import { FastifyInstance } from "fastify";
import { UserInterface, users } from "../../users";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/password",
    {
      schema: {
        summary: "Authenticate with e-mail & password",
        tags: ["auth"],
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({ token: z.string() }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body;

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (!userFromEmail) {
        return reply.status(400).send({ message: "User not found" });
      }

      if (userFromEmail.passwordHash == null) {
        return reply
          .status(400)
          .send({ message: "User does not have a password, use social login" });
      }

      const passwordValid = await compare(password, userFromEmail.passwordHash);
      if (!passwordValid) {
        return reply.status(400).send({ message: "Invalid credencials." });
      }

      const token = await reply.jwtSign({ sub: userFromEmail.id })

      return reply.status(201).send({ token });
    }
  );
}
