import axios from "axios";
import { validateCodes } from "./airportMapping";

const PYTHON_API = process.env.ML_API_URL || "http://ml-api:5000";

interface PredictInput {
  empresa: string;
  origem: string;
  destino: string;
  mes: number;
  ano: number;
}

interface PredictResponse {
  predicted_tarifa?: number;
  success: boolean;
  error?: string;
  details?: any;
}

export async function predictFare(input: PredictInput): Promise<PredictResponse> {
  // 1) Validar contra o categorical_info.json
  const valid = validateCodes(input.empresa, input.origem, input.destino);

  if (!valid.empresa || !valid.origem || !valid.destino) {
    const msg = "Valores não reconhecidos pelo modelo";
    console.warn(msg, { input, valid });

    return {
      success: false,
      error: msg,
      details: {
        empresa: input.empresa,
        origem: input.origem,
        destino: input.destino,
        valid
      },
    };
  }

  // 2) Chamar o Python
  try {
    const response = await axios.post(`${PYTHON_API}/predict`, {
      empresa: input.empresa,
      origem: input.origem,
      destino: input.destino,
      mes: input.mes,
      ano: input.ano,
    });

    const data = response.data as PredictResponse;

    // Se o Python retornou success: false, apenas repassamos
    if (!data.success) {
      console.warn(" Python retornou erro na predição:", data);
      return data;
    }

    return data;
  } catch (err: any) {
    console.error("Erro ao chamar serviço Python:", err.message || err);
    return {
      success: false,
      error: "Falha ao conectar ao serviço de previsão (Python).",
    };
  }
}
