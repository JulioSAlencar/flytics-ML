Aqui está um **README.md completo, profissional e pronto para colocar no GitHub**, explicando *como rodar o projeto Flytics com Docker*, como rodar manualmente, como fazer deploy e boas práticas.
Organizei tudo de forma clara e completa.

---

# 🛫 **FLYTICS — Guia Completo de Execução e Deploy**

Sistema de previsão de tarifas aéreas utilizando **Node.js**, **React (Vite)**, **Python (Flask)** e **LightGBM**, totalmente integrado via **Docker Compose**.

---

# 📦 **Pré-requisitos**

Antes de rodar o projeto, você precisa ter instalado:

* **Docker** → [https://www.docker.com/get-started](https://www.docker.com/get-started)
* **Docker Compose** (já vem junto nas versões novas do Docker Desktop)
* (Opcional) **Node >= 18** para rodar sem Docker
* (Opcional) **Python >= 3.9** se quiser rodar o ML localmente

---

# 🔥 **Rodando com Docker (RECOMENDADO)**

Este é o modo principal de execução do projeto.
Ele sobe automaticamente:

* Backend (Node.js)
* Frontend (React/Vite)
* API de Machine Learning (Python/Flask)
* Rede interna entre containers

### 📁 Estrutura esperada

```
project/
 ├─ backend/
 ├─ frontend/
 ├─ ml-api/
 ├─ docker-compose.yml
```

---

# ▶️ **1 — Subir tudo**

Na raiz do projeto:

```sh
docker compose up --build
```

Isso irá:

* Construir as imagens (Node, Python, React)
* Criar a rede interna Docker
* Rodar os três serviços
* Disponibilizar as portas:

| Serviço         | Porta                                          |
| --------------- | ---------------------------------------------- |
| Frontend (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend (Node)  | [http://localhost:3001](http://localhost:3001) |
| API ML (Flask)  | [http://localhost:5000](http://localhost:5000) |

---

# 🧪 **2 — Testar se está funcionando**

### 📌 Testar backend:

```
http://localhost:3001/api/flights?origin=SBGR&destination=SBRF&departure=2025-11-24
```

### 📌 Testar a API de aeroportos:

```
http://localhost:3001/api/flights/airports
```

### 📌 Testar API do modelo ML diretamente:

```
POST http://localhost:5000/predict
{
  "empresa": "AZU",
  "origem": "SBGR",
  "destino": "SBRF",
  "mes": 11,
  "ano": 2025
}
```

---

# 🔁 **3 — Parar tudo**

```sh
docker compose down
```

Se quiser limpar volumes:

```sh
docker compose down -v
```

---

# 🧩 **4 — Atualizando código em desenvolvimento**

Os containers backend e frontend estão com volumes ligados:

```
./backend/src:/app/src
./frontend/src:/app/src
```

➡️ **Alterou o código → atualiza automaticamente** (hot reload).
Sem necessidade de rebuild.

---

# 💻 **Rodar o projeto sem Docker (modo manual)**

### ▶️ Rodar o backend (Node.js)

```sh
cd backend
npm install
npm run dev
```

Disponível em:

```
http://localhost:3001
```

---

### ▶️ Rodar o frontend (React + Vite)

```sh
cd frontend
npm install
npm run dev
```

Disponível em:

```
http://localhost:5173
```

---

### ▶️ Rodar a API de ML (Python)

#### 1. Criar e ativar ambiente virtual:

```sh
cd ml-api
python3 -m venv venv
source venv/bin/activate
```

#### 2. Instalar dependências:

```sh
pip install -r requirements.txt
```

#### 3. Rodar:

```sh
python predict_api.py
```

Disponível em:

```
http://localhost:5000
```

---

# 🚀 **Guia de Deploy (Produção)**

## ✔️ 1. Build de produção com Docker

Execute:

```sh
docker compose -f docker-compose.yml up --build -d
```

Ou, para separar desenvolvimento / produção:

```
docker compose -f docker-compose.prod.yml up --build -d
```

Você pode ter uma versão assim:

---

## 🧱 2. Configurações recomendadas para produção

### 🔐 Não use ts-node-dev no backend

Troque o comando no Dockerfile:

```Dockerfile
CMD ["node", "dist/server.js"]
```

E compile antes:

```sh
npm run build
```

---

### 🛡️ Configure NGINX reverso (opcional)

Recomendado:

* Redirecionar `/api` → backend
* Redirecionar `/ml` → python
* Servir o frontend estático

---

### 💾 Montar volumes somente onde necessário

Evitar:

```
./backend/src:/app/src   (use apenas em DEV)
./frontend/src:/app/src  (use apenas em DEV)
```

---

### 🧩 Deploy recomendado

* **Render**
* **Railway**
* **Fly.io**
* **AWS ECS**
* **Azure WebApp + Container Registry**
* **Google Cloud Run**

---

# 🐳 **3. Checklist antes do deploy**

### ✔ Backend

* Compilado em JS (`dist/`)
* Variáveis de ambiente:

  * `ML_API_URL=http://ml-api:5000`
  * `PORT=3001`

### ✔ ML API

* Modelos dentro da pasta `model_export2`
* Python version match com scikit-learn
* Não carregar debug mode em produção

### ✔ Frontend

* Fazer build de produção:

```sh
npm run build
```

* Servir `/dist` com nginx

---