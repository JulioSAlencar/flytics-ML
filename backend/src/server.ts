// backend/src/server.ts

import express from "express";
import cors from "cors";
import flightsRoutes from "./routes/flights"; // precisa de um arquivo de rotas

const app = express();

app.use(cors());
app.use(express.json());

// Rotas de voos
app.use("/api/flights", flightsRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
