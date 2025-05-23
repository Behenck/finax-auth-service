import { FastifyInstance } from "fastify";
import { hash } from "bcryptjs";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        summary: "Create a new account",
        tags: ["auth"],
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({
            message: z.string().default("User created successfully"),
          }),
          400: z.object({
            message: z.string().default("User already exists"),
          }),
        },
      },
    },
    async (req, reply) => {
      const { name, email, password } = req.body;

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (userWithSameEmail) {
        return reply
          .status(400)
          .send({ message: "user with e-mail already exists." });
      }

      const [, domain] = email.split("@");

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUserByDomain: true,
        },
      });

      const passwordHash = await hash(password, 6);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      });

      return reply.status(201).send();
    }
  );
}
