import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  db: {
    url: "postgresql://postgres:cesi@localhost:5432/twitch_clone",
  },
});