from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ===== Carregar modelo e encoders =====
model_dir = "./model_export2"
model_path = os.path.join(model_dir, "lightgbm_model.pkl")
encoders_path = os.path.join(model_dir, "encoders.pkl")

print(f"📦 Carregando modelo de: {model_path}")
print(f"📦 Carregando encoders de: {encoders_path}")

model = joblib.load(model_path)
encoders = joblib.load(encoders_path)

@app.route("/predict", methods=["POST"])
def predict():
  try:
    data = request.json or {}
    print("🔍 Requisição recebida em /predict:", data)

    # Checagem básica de campos obrigatórios
    required = ["empresa", "origem", "destino", "mes", "ano"]
    missing = [k for k in required if k not in data]
    if missing:
      return jsonify({
        "error": f"Campos faltando: {', '.join(missing)}",
        "success": False
      }), 400

    # Montar DataFrame exatamente com os nomes esperados pelo modelo
    input_data = pd.DataFrame({
      "EMPRESA": [data["empresa"]],
      "ORIGEM": [data["origem"]],
      "DESTINO": [data["destino"]],
      "MES": [int(data["mes"])],
      "ANO": [int(data["ano"])]
    })

    # Aplicar LabelEncoder nas colunas categóricas
    for col in ["EMPRESA", "ORIGEM", "DESTINO"]:
      val = input_data[col].iloc[0]
      if val not in encoders[col].classes_:
        msg = f"Valor '{val}' não existe no encoder de '{col}'."
        print("⚠️", msg)
        return jsonify({
          "error": msg,
          "success": False
        }), 200

      input_data[col] = encoders[col].transform(input_data[col])

    # Fazer a predição
    prediction = model.predict(input_data)[0]
    print("✅ Predição gerada:", prediction)

    return jsonify({
      "predicted_tarifa": float(prediction),
      "success": True
    }), 200

  except Exception as e:
    print("💥 Erro interno no /predict:", str(e))
    return jsonify({
      "error": str(e),
      "success": False
    }), 500

if __name__ == "__main__":
  # Rode localmente em 0.0.0.0:5000
  app.run(host="0.0.0.0", port=5000, debug=True)
