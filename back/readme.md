**Instalar as dependências**

> _npm i_

**Rodar a aplicação**

> Criar um arquivo .env na raiz do projeto passando as variáveis :
```
DB_DIALECT="mysql"
DB_NAME="nome do banco"
DB_USERNAME="nome do usuario"
DB_PASSWORD="senha do usuario"
DB_HOST="host do banco"
JWT_SECRET="Alguma string aqui"
```

> Definindo configurações do SMTP google
```
CLIENT_URL="http://localhost:3000"
EMAIL_SERVICE="Gmail"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=456
EMAIL_USER="seu email do gmail"
EMAIL_PASS="Senha de app gerada, necessário ter verificação de duas estapas"
```

Criar um database com o nome passado na variável _DB_NAME_

> _npm run dev_

