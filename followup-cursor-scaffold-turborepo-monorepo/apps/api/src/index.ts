import "dotenv/config";
import { API_ORIGIN, API_PORT } from "@followup/config";
import { buildApp } from "./app.js";

const app = await buildApp();
const port = Number(process.env.PORT ?? API_PORT);

await app.listen({ port, host: "127.0.0.1" });
app.log.info(`FollowUp API ready at ${API_ORIGIN}`);
