# Aplicação de Microserviço

Este projeto é um exemplo de uma aplicação de microserviço, criada com o objetivo de aprender sobre a arquitetura de microserviços. A aplicação consiste em um conjunto de serviços independentes que se comunicam entre si para realizar funcionalidades específicas.

## Features

- Autenticação de Usuários
- Gerenciamento de Conta
- Gerenciamento de Produtos

## Pré-requisitos

### Node.js

Certifique-se de ter o Node.js e npm instalados em seu sistema. Se não tiver, você pode baixá-los do site oficial do [Node.js](https://nodejs.org/).

### Docker

A instalação do Docker varia dependendo do sistema operacional que você está usando. Aqui estão alguns links para orientações de instalação do Docker para diferentes sistemas operacionais:

- Para Windows: [Instalar Docker Desktop no Windows](https://docs.docker.com/desktop/windows/install/)
- Para macOS: [Instalar Docker Desktop no Mac](https://docs.docker.com/desktop/mac/install/)
- Para Ubuntu: [Instalar Docker no Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

## Instalação

Esse é um guia passo a passo para instalar e construir a aplicação.

### Aplicação

Entrar no diretório de cada serviço e executar os seguintes comandos:

```bash
# npm install
# npm run build
```

### Docker Container

Você precisa iniciar o container definido no arquivo `docker-compose.yml` dentro do diretório da API com o seguinte comando:

```bash
# docker-compose up -d
```

### Environments

Há um arquivo `exemple.env` em cada serviço para ajudar a entender sobre as variáveis de ambiente.

Para entender mais, acesse a [Documentação](https://www.prisma.io/docs/orm/overview/databases) do Prisma sobre banco de dados.

### Postman

Para configurar a Colletion e o Environments no postman, basta importar os arquivos `"API MC.postman_collection.json"` e `"API MC.postman_environment.json"`

## Rodando

Depois de instalar e configurar o seu ambiente, entre no diretório de cada serviço e execute o comando:

```bash
# npm run start
```

## License

Este projeto está licenciado sob a licença MIT. Para mais detalhes, consulte o arquivo [LICENSE](./LICENSE).

## Tecnologias Utilizadas

- Node.js
- Typescript
- Express.js
- Prisma
- Kafka
- Docker
