from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ===== Carregar modelo e encoders =====
model_dir = './model_export2'
model = joblib.load(os.path.join(model_dir, 'lightgbm_model.pkl'))
encoders = joblib.load(os.path.join(model_dir, 'encoders.pkl'))

# ===== ROTA DE PREDIÇÃO =====
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # O modelo NÃO USA TARIFA NO INPUT
        input_data = pd.DataFrame({
            'EMPRESA': [data['empresa']],
            'ORIGEM': [data['origem']],
            'DESTINO': [data['destino']],
            'MES': [int(data['mes'])],
            'ANO': [int(data['ano'])]
        })

        # Aplicar LabelEncoder
        for col in ['EMPRESA', 'ORIGEM', 'DESTINO']:
            if input_data[col].iloc[0] not in encoders[col].classes_:
                return jsonify({
                    'error': f"Valor '{input_data[col].iloc[0]}' não existe no encoder de '{col}'.",
                    'success': False
                })
            input_data[col] = encoders[col].transform(input_data[col])

        # Fazer a predição
        prediction = model.predict(input_data)[0]

        return jsonify({
            'predicted_tarifa': float(prediction),
            'success': True
        })

    except Exception as e:
        return jsonify({'error': str(e), 'success': False})

if __name__ == '__main__':
    app.run(port=5000)
