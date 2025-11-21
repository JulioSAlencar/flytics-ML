FROM python:3.9-slim

WORKDIR /app

# Dependências necessárias para compilar e rodar LightGBM
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    cmake \
    libgomp1 \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY predict_api.py ./
COPY model_export2 ./model_export2

EXPOSE 5000

CMD ["python", "predict_api.py"]
