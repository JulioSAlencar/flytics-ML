// backend/src/controllers/flightsController.ts

import { Request, Response } from "express";
import { predictFare } from "../services/flightMLService";
import { convertAirport } from "../services/airportMapping";

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, departure, return: returnDate } = req.query;

    console.log("🔍 Parâmetros recebidos:", {
      origin,
      destination,
      departure,
      returnDate,
    });

    if (!origin || !destination || !departure) {
      return res.status(400).json({ message: "Parâmetros incompletos." });
    }

    // 1) Converter sempre IATA → ICAO (ou aceitar se já for ICAO)
    const origemICAO = convertAirport(String(origin));
    const destinoICAO = convertAirport(String(destination));

    console.log("🔄 Aeroportos convertidos:", {
      origin,
      destination,
      origemICAO,
      destinoICAO,
    });

    const results: any[] = [];

    // ============================
    // 🔵 PREVISÃO — IDA
    // ============================
    const idaPrediction = await predictFare({
      empresa: "AZU", // aqui você pode depois parametrizar via query se quiser
      origem: origemICAO,
      destino: destinoICAO,
      mes: new Date(String(departure)).getMonth() + 1,
      ano: new Date(String(departure)).getFullYear(),
    });

    results.push({
      origin: origemICAO,
      destination: destinoICAO,
      date: departure,
      type: "ida",
      price: idaPrediction.predicted_tarifa ?? null,
      success: idaPrediction.success,
      error: idaPrediction.error || null,
    });

    // ============================
    // 🔵 PREVISÃO — VOLTA (opcional)
    // ============================
    if (returnDate) {
      const voltaPrediction = await predictFare({
        empresa: "AZU",
        origem: destinoICAO,
        destino: origemICAO,
        mes: new Date(String(returnDate)).getMonth() + 1,
        ano: new Date(String(returnDate)).getFullYear(),
      });

      results.push({
        origin: destinoICAO,
        destination: origemICAO,
        date: returnDate,
        type: "volta",
        price: voltaPrediction.predicted_tarifa ?? null,
        success: voltaPrediction.success,
        error: voltaPrediction.error || null,
      });
    }

    // Aqui, mesmo se der erro no ML, respondemos 200 com success=false nos itens
    return res.json(results);
  } catch (err: any) {
    console.error("ERRO REAL no searchFlights:", err.message, err.stack);
    return res.status(500).json({ error: err.message || "Erro ao buscar voos." });
  }
};
