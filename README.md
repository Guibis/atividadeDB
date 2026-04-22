# 🐾 Amigo Fiel Pet Shop — Sistema de Gestão

Sistema web completo para gerenciamento de um Pet Shop, com interface moderna e API integrada a um banco de dados MySQL.

Este é um projeto front-end para um sistema de gestão completo de um Pet Shop. Ele fornece uma interface moderna, amigável e responsiva para administrar o seu negócio.

A aplicação inclui painéis (dashboards) e formulários, estruturada com navegação em barra lateral (sidebar) e exibições instantâneas de dados cruciais do pet shop.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)

---

## 📋 Funcionalidades

### Clientes

- Cadastrar, editar e deletar clientes
- Visualizar quantidade de pets de cada cliente
- Busca por nome, CPF ou telefone

### Pets

- Cadastrar, editar e deletar pets
- Seleção do tipo de animal (Cachorro, Gato, Pássaro, Coelho, Hamster ou **Outro** — com campo customizado)
- Vinculação automática ao dono (cliente)
- Exibição do nome do dono na tabela

### Produtos

- Cadastrar, editar e deletar produtos
- Controle de estoque com indicador visual (verde/laranja)

### Compras

- Registrar novas compras com seleção de cliente, data e múltiplos produtos
- Cálculo automático do valor total
- Validação de estoque (não permite comprar mais do que o disponível)
- Subtração automática do estoque ao confirmar a compra
- Editar e deletar compras existentes

### Dashboard

- Contadores de clientes, pets, produtos e compras
- Últimas compras realizadas

---

## 🛠️ Tecnologias

| Camada   | Tecnologia                      |
| -------- | ------------------------------- |
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend  | Node.js + Express 5             |
| Banco    | MySQL 8                         |
| Outros   | dotenv, cors, mysql2, nodemon   |

---

## 📁 Estrutura do Projeto

```
atividadeDB/
├── assets/                  # Imagens e ícones
├── config/
│   └── db.js                # Configuração de conexão MySQL
├── controllers/
│   ├── clientesController.js
│   ├── petsController.js
│   ├── produtosController.js
│   └── produtosCompradosController.js
├── routes/
│   ├── clientesRoutes.js
│   ├── petsRoutes.js
│   ├── produtosRoutes.js
│   └── produtosCompradosRoutes.js
├── index.html               # Interface do sistema
├── script.js                # Lógica do frontend
├── style.css                # Estilos da interface
├── server.js                # Servidor Express
├── package.json
├── .env                     # Variáveis de ambiente (não versionado)
└── .gitignore
```

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [MySQL](https://dev.mysql.com/downloads/mysql/) 8.0 ou superior
- npm (já vem com o Node.js)

---

## 🚀 Como Rodar

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd atividadeDB
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar o banco de dados

Abra o MySQL (Workbench, terminal, etc.) e execute o script SQL abaixo:

```sql
CREATE DATABASE IF NOT EXISTS AmigoFiel_DB;
USE AmigoFiel_DB;

CREATE TABLE Cliente (
    CPF VARCHAR(14) PRIMARY KEY,
    Nome VARCHAR(100),
    Telefone VARCHAR(15)
);

CREATE TABLE Pets (
    id_animal INT AUTO_INCREMENT PRIMARY KEY,
    animal VARCHAR(50),
    Nome VARCHAR(100),
    Raca VARCHAR(100),
    fk_Clientes_id_cliente VARCHAR(14),
    FOREIGN KEY (fk_Clientes_id_cliente) REFERENCES Cliente(CPF)
);

CREATE TABLE Produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    preco DECIMAL(10,2),
    qtd_estoque INT
);

CREATE TABLE Compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    data_compra DATE,
    valor_total DECIMAL(10,2),
    fk_Clientes_id_cliente VARCHAR(14),
    FOREIGN KEY (fk_Clientes_id_cliente) REFERENCES Cliente(CPF)
);

CREATE TABLE Produtos_Comprados (
    fk_Compras_id_compra INT,
    fk_Produtos_id_produto INT,
    Nome VARCHAR(100),
    Quantidade INT,
    Valor DECIMAL(10,2),
    PRIMARY KEY (fk_Compras_id_compra, fk_Produtos_id_produto),
    FOREIGN KEY (fk_Compras_id_compra) REFERENCES Compra(id_compra),
    FOREIGN KEY (fk_Produtos_id_produto) REFERENCES Produtos(id_produto)
);
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=AmigoFiel_DB
PORT=3000
```

> ⚠️ Substitua `sua_senha_aqui` pela senha do seu MySQL.

### 5. Iniciar o servidor

**Modo produção:**

```bash
npm start
```

**Modo desenvolvimento (com auto-reload):**

```bash
npm run dev
```

### 6. Acessar o sistema

Abra o navegador e acesse:

```
http://localhost:3000
```

---

## 📡 Endpoints da API

| Método   | Rota                    | Descrição                |
| -------- | ----------------------- | ------------------------ |
| `GET`    | `/clientes`             | Listar todos os clientes |
| `POST`   | `/clientes`             | Cadastrar novo cliente   |
| `PUT`    | `/clientes`             | Editar cliente           |
| `DELETE` | `/clientes/:cpf`        | Deletar cliente          |
| `GET`    | `/pets`                 | Listar todos os pets     |
| `POST`   | `/pets`                 | Cadastrar novo pet       |
| `PUT`    | `/pets`                 | Editar pet               |
| `DELETE` | `/pets/:id_animal`      | Deletar pet              |
| `GET`    | `/produtos`             | Listar todos os produtos |
| `POST`   | `/produtos`             | Cadastrar novo produto   |
| `PUT`    | `/produtos`             | Editar produto           |
| `DELETE` | `/produtos/:id_produto` | Deletar produto          |
| `GET`    | `/compras`              | Listar todas as compras  |
| `POST`   | `/compras`              | Cadastrar nova compra    |
| `PUT`    | `/compras/:id_compra`   | Editar compra            |
| `DELETE` | `/compras/:id_compra`   | Deletar compra           |

---

## 📝 Licença

ISC
