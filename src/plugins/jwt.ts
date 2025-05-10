import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import dotenv from "dotenv";
dotenv.config();

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,
  });
});
