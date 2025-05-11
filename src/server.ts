import dotenv from "dotenv";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import { createAccount } from "./routes/auth/create-account";
import { getProfile } from "./routes/auth/get-profile";
import { requestPasswordRecover } from "./routes/auth/request-password-recover";
import { resetPassword } from "./routes/auth/reset-password";
import { errorHandler } from "./error-handler";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

dotenv.config();
const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Next.js Saas",
      description: "Full-stack Saas app with multi-tenant & RBAC.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("🚨 variável de ambiente JWT_SECRET não definida");
}

app.register(fastifyJwt, {
  secret: jwtSecret,
});

app.register(fastifyCors);

app.register(authenticateWithPassword);
app.register(createAccount);
app.register(getProfile);
app.register(requestPasswordRecover);
app.register(resetPassword);

app.listen({ port: Number(process.env.PORT) }, () => {
  console.log(`🚀 Auth service online em http://localhost:${process.env.PORT}`);
});
