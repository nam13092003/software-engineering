import { createApp } from "./app";
import { initDatabase } from "./data/database";
import { env } from "./config/env";

async function bootstrap() {
  try {
    await initDatabase();
    const app = createApp();

    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start the server", error);
    process.exit(1);
  }
}

void bootstrap();
