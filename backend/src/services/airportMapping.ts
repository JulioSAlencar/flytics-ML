import fs from "fs";
import path from "path";

interface CategoricalInfo {
  empresas: string[];
  origens: string[];
  destinos: string[];
}

// Carrega categorical_info.json
const filePath = path.resolve(__dirname, "../data/categorical_info.json");
const raw = fs.readFileSync(filePath, "utf-8");
const info: CategoricalInfo = JSON.parse(raw);

// ---------- CARREGA CSV DA ANAC (SEM IATA) ----------
const csvPath = path.resolve(__dirname, "../data/cadastro_aerodromos.csv");
let csvRaw = fs.readFileSync(csvPath, "utf-8");

// Remover BOM se existir
if (csvRaw.charCodeAt(0) === 0xFEFF) {
  csvRaw = csvRaw.slice(1);
}

const csvLines = csvRaw.split(/\r?\n/);
const header = csvLines[0].split(";").map(h =>
  h.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
);

function findColumn(possibilities: string[]) {
  for (const p of possibilities) {
    const idx = header.indexOf(
      p.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

const idxICAO = findColumn(["CODIGO OACI"]);
const idxMunicipio = findColumn(["MUNICIPIO ATENDIDO"]);

if (idxICAO === -1 || idxMunicipio === -1) {
  console.error("❌ Erro no CSV da ANAC. Cabeçalho:", header);
}

const icaoToCity: Record<string, string> = {};

for (let i = 1; i < csvLines.length; i++) {
  const cols = csvLines[i].split(";");

  const icao = cols[idxICAO]?.trim().toUpperCase();
  const city = cols[idxMunicipio]?.trim().toUpperCase();

  if (icao && city) {
    icaoToCity[icao] = city;
  }
}

// ---------- Mapeamento manual IATA → ICAO ----------
const iataToIcaoManual: Record<string, string> = {
  GRU: "SBGR",
  CGH: "SBSP",
  GIG: "SBGL",
  SDU: "SBRJ",
  REC: "SBRF",
  FOR: "SBFZ",
  SSA: "SBSV",
  BEL: "SBBE",
  POA: "SBPA",
  VCP: "SBKP",
  BSB: "SBBR",
  CNF: "SBCF"
};

// ---------- Função de conversão ----------
export function convertAirport(code: string) {
  if (!code) return "";

  const upper = code.toUpperCase();

  // Se já for ICAO válido
  if (upper.length === 4 && (info.origens.includes(upper) || info.destinos.includes(upper))) {
    return upper;
  }

  // Tenta IATA manual
  if (iataToIcaoManual[upper]) {
    return iataToIcaoManual[upper];
  }

  console.warn("⚠️ Código não reconhecido:", upper);
  return upper;
}

export function validateCodes(empresa: string, origem: string, destino: string) {
  return {
    empresa: info.empresas.includes(empresa),
    origem: info.origens.includes(origem),
    destino: info.destinos.includes(destino),
  };
}

export { info };
