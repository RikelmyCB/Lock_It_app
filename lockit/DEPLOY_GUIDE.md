# 🚀 Guia de Deploy do Backend para Nuvem

Este guia explica como fazer deploy do servidor backend do Lock It para a nuvem, permitindo acesso de qualquer lugar.

## 📋 Pré-requisitos

1. Conta no serviço de hospedagem escolhido (Render, Railway, ou Heroku)
2. Banco de dados MySQL na nuvem (PlanetScale, AWS RDS, ou serviço similar)
3. Git configurado no seu computador

---

## 🎯 Opções de Hospedagem

### 1. **Render** (Recomendado - Gratuito)
- ✅ Plano gratuito disponível
- ✅ Fácil configuração
- ✅ Deploy automático via Git
- ⚠️ Servidor "dorme" após 15min de inatividade (plano gratuito)

### 2. **Railway** (Recomendado - $5/mês)
- ✅ Muito fácil de usar
- ✅ Deploy automático
- ✅ Não "dorme"
- ⚠️ Pago (mas tem créditos grátis)

### 3. **Heroku**
- ✅ Confiável
- ⚠️ Não tem mais plano gratuito
- ⚠️ Mais complexo

---

## 📝 Passo a Passo - Render (Gratuito)

### 1. Preparar o Banco de Dados

Você precisa de um MySQL na nuvem. Opções:

#### Opção A: PlanetScale (Gratuito)
1. Acesse [planetscale.com](https://planetscale.com)
2. Crie uma conta gratuita
3. Crie um novo banco de dados
4. Anote as credenciais de conexão

#### Opção B: AWS RDS (Pago)
1. Acesse AWS Console
2. Crie uma instância RDS MySQL
3. Configure segurança (permita conexões externas)
4. Anote as credenciais

### 2. Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Crie uma conta (pode usar GitHub)
3. Vá em "New" → "Web Service"

### 3. Conectar Repositório

1. Conecte seu repositório GitHub/GitLab
2. Selecione o repositório do Lock It

### 4. Configurar Build

- **Name**: `lockit-backend`
- **Environment**: `Node`
- **Build Command**: `cd src/backend && npm install`
- **Start Command**: `cd src/backend && npm start`
- **Root Directory**: (deixe vazio)

### 5. Configurar Variáveis de Ambiente

No painel do Render, vá em "Environment" e adicione:

```
NODE_ENV=production
DB_HOST=seu-host-mysql.com
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_PORT=3306
DB_NAME=lockitdb
SECRET_KEY=e3f7b27d3fb512429ad7212bd15fcac1d70ac47f1fcac1f4176b428d666570e7f1fa4f7840827bf1d38b52575357d671ef43ffde8ac6ae1b71760bf38e524ace
TOKEN_EXPIRATION=150d
```

### 6. Deploy

1. Clique em "Create Web Service"
2. Aguarde o deploy (5-10 minutos)
3. Anote a URL gerada (ex: `https://lockit-backend.onrender.com`)

---

## 📝 Passo a Passo - Railway

### 1. Criar Conta

1. Acesse [railway.app](https://railway.app)
2. Crie conta com GitHub

### 2. Novo Projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha seu repositório

### 3. Configurar

1. Railway detecta automaticamente Node.js
2. Configure o root directory: `src/backend`
3. Adicione as variáveis de ambiente (mesmas do Render)

### 4. Deploy

1. Railway faz deploy automático
2. Anote a URL gerada

---

## 🔧 Atualizar o App Mobile

Após o deploy, você precisa atualizar a URL da API no app:

### 1. Editar `app.json`

```json
{
  "expo": {
    "extra": {
      "API_URL": "https://seu-servidor.onrender.com"
    }
  }
}
```

### 2. Rebuild do App

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 🗄️ Criar Tabelas no Banco de Dados

Após conectar o banco na nuvem, você precisa criar as tabelas. Execute este SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_data (
    data_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note_key TEXT,
    note_value TEXT,
    password_key TEXT,
    pass_title TEXT,
    email TEXT,
    email_title TEXT,
    keycard_title TEXT,
    keycard_name TEXT,
    keycard_number TEXT,
    keycard_data TEXT,
    security_code TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Não commite credenciais!

1. Adicione `.env` ao `.gitignore`
2. Use variáveis de ambiente no serviço de hospedagem
3. Nunca compartilhe suas credenciais

### Melhorias de Segurança Recomendadas:

1. **Use HTTPS** (Render e Railway fornecem automaticamente)
2. **Rate Limiting** - Adicione limite de requisições
3. **CORS** - Já configurado no código
4. **Validação de Input** - Adicione validação mais rigorosa

---

## 🐛 Troubleshooting

### Servidor não inicia
- Verifique os logs no painel do Render/Railway
- Confirme que todas as variáveis de ambiente estão configuradas

### Erro de conexão com banco
- Verifique se o banco permite conexões externas
- Confirme host, porta, usuário e senha
- Teste a conexão localmente primeiro

### App não consegue conectar
- Verifique se a URL está correta no `app.json`
- Confirme que o servidor está rodando (acesse a URL no navegador)
- Verifique CORS (já configurado no código)

---

## 📚 Recursos Úteis

- [Documentação Render](https://render.com/docs)
- [Documentação Railway](https://docs.railway.app)
- [PlanetScale Docs](https://planetscale.com/docs)

---

## 💡 Dicas

1. **Teste localmente primeiro** - Use `.env` local para testar
2. **Monitore os logs** - Acompanhe erros no painel do serviço
3. **Backup do banco** - Configure backups regulares
4. **Monitoramento** - Use serviços como UptimeRobot para monitorar

---

## ✅ Checklist Final

- [ ] Banco de dados MySQL criado na nuvem
- [ ] Tabelas criadas no banco
- [ ] Servidor deployado (Render/Railway)
- [ ] Variáveis de ambiente configuradas
- [ ] URL do servidor anotada
- [ ] `app.json` atualizado com nova URL
- [ ] App rebuild e testado
- [ ] Teste de login/cadastro funcionando

---

**Pronto!** Seu servidor agora está na nuvem e acessível de qualquer lugar! 🎉

