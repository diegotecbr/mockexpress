const express = require('express');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Carregar chave e certificado SSL do diretório 'ssl'
const key = fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'));
const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert'));
const options = {
  key: key,
  cert: cert
};

// Middleware para parsear JSON
app.use(express.json());

// Dados mockados para mudanças no ServiceNow
let mudancas = [];

// Função para gerar um número de pacote no padrão de um SHA-1 commit aleatório
function gerarNumeroPacote() {
  return crypto.randomBytes(20).toString('hex');
}

// Função para gerar um número de mudança aleatório
function gerarNumeroMudanca() {
  return 'CHG' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

// Rota básica para a raiz
app.get('/', (req, res) => {
  res.send('Bem-vindo à API Mock!');
});

// Rota para criar uma mudança no ServiceNow
app.post('/mudancas', (req, res) => {
  const novaMudanca = req.body;
  novaMudanca.id = mudancas.length ? mudancas[mudancas.length - 1].id + 1 : 1;
  novaMudanca.numeroMudanca = gerarNumeroMudanca();
  novaMudanca.numeroPacote = gerarNumeroPacote();
  mudancas.push(novaMudanca);
  res.status(201).json(novaMudanca);
});

// Rota para resgatar uma mudança específica pelo número da mudança
app.get('/mudancas/numero/:numeroMudanca', (req, res) => {
  const { numeroMudanca } = req.params;
  const mudanca = mudancas.find(m => m.numeroMudanca === numeroMudanca);
  if (mudanca) {
    res.json(mudanca);
  } else {
    res.status(404).send({ message: 'Mudança não encontrada' });
  }
});

// Iniciando o servidor HTTPS
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor HTTPS rodando em https://localhost:${port}`);
});
