import os
import json
import pandas as pd
from pathlib import Path

print("=== Gerando histórico de preços direto dos CSVs ===")

base_folder = "./dataset"
history = {}

# Caminho de saída
output_path = Path("./backend/src/data/historico_precos.json")
output_path.parent.mkdir(parents=True, exist_ok=True)

# Lista de pastas dentro de dataset/
year_folders = [f for f in os.listdir(base_folder) if os.path.isdir(os.path.join(base_folder, f))]

for year in year_folders:
    year_path = os.path.join(base_folder, year)
    csv_files = [f for f in os.listdir(year_path) if f.endswith(".CSV")]

    for csv_file in csv_files:
        file_path = os.path.join(year_path, csv_file)
        print(f"Lendo: {file_path}")

        # Lendo em chunks para evitar explodir memória
        try:
            for chunk in pd.read_csv(file_path, sep=';', chunksize=200_000):
                # Garantir colunas
                if not {"ORIGEM", "DESTINO", "TARIFA"}.issubset(chunk.columns):
                    print(f"Arquivo ignorado (colunas ausentes): {csv_file}")
                    continue

                # TARIFA → float
                chunk["TARIFA"] = (
                    chunk["TARIFA"]
                    .astype(str)
                    .str.replace(",", ".")
                    .astype(float)
                )

                for _, row in chunk.iterrows():
                    origin = str(row["ORIGEM"]).strip().upper()
                    dest   = str(row["DESTINO"]).strip().upper()
                    price  = float(row["TARIFA"])

                    if price <= 0:
                        continue

                    key = (origin, dest)

                    if key not in history:
                        history[key] = {
                            "origin": origin,
                            "destination": dest,
                            "min_price": price,
                            "max_price": price
                        }
                    else:
                        history[key]["min_price"] = min(history[key]["min_price"], price)
                        history[key]["max_price"] = max(history[key]["max_price"], price)

        except Exception as e:
            print("Erro lendo chunk:", e)

# Converter para lista
history_list = list(history.values())

# Salvar
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(history_list, f, ensure_ascii=False, indent=4)

print("\n=== HISTÓRICO GERADO COM SUCESSO! ===")
print(f"Arquivo salvo em: {output_path}")
print(f"Total de rotas processadas: {len(history_list)}")
