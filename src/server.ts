import Fastify from "fastify";
import dotenv from "dotenv";
import jwtPlugin from "./plugins/jwt";
import { authRoutes } from "./routes/auth";
import { FastifyRequest } from "fastify/types/request";
import { FastifyReply } from "fastify/types/reply";

dotenv.config();
const app = Fastify();

app.register(jwtPlugin);

app.decorate(
  "authenticate",
  async function (req: FastifyRequest, reply: FastifyReply) {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }
);

app.register(authRoutes);

app.listen({ port: Number(process.env.PORT) }, () => {
  console.log(`🚀 Auth service online em http://localhost:${process.env.PORT}`);
});
