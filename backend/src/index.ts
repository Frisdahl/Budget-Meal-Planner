import "./config/loadEnv.js";
import { getEnv, validateEnv } from "./config/env.js";
import { createApp } from "./app.js";

validateEnv();

const PORT = getEnv().PORT;
const app = createApp();

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(
    `[Spoonacular] API key loaded: ${Boolean(getEnv().SPOONACULAR_API_KEY)}`,
  );
});
