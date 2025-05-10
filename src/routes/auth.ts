import { FastifyInstance } from "fastify";
import { UserInterface, users } from "../users";
import bcrypt from "bcrypt";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", async (req, reply) => {
    const { email, password } = req.body as UserInterface;

    const existsUser = users.find((user) => user.email === email);

    if (existsUser) {
      return reply.status(400).send({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    users.push({ email, password: passwordHash });

    return reply.status(201).send({ message: "User created" });
  });

  fastify.post("/login", async (req, reply) => {
    const { email, password } = req.body as UserInterface;

    const user = users.find((user) => user.email === email);
    if (!user) {
      return reply.status(400).send({ message: "User not found" });
    }

    const PasswordValid = await bcrypt.compare(password, user.password);
    if (!PasswordValid) {
      return reply.status(400).send({ message: "Invalid password" });
    }

    const token = fastify.jwt.sign({ email });

    return { token };
  });

  fastify.get(
    "/me",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      return { user: req.user };
    }
  );
}
