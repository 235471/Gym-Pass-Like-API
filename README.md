# App

GymPass style app.

## RFs (Requisitos funcionais)

- [ ] Deve ser possível se cadastrar;
- [ ] Deve ser possível se autenticar;
- [ ] Deve ser possível obter o perfil de um usuário logado;
- [ ] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [ ] Deve ser possível o usuário obter o seu histórico de check-ins;
- [ ] Deve ser possível o usuário buscar academias próximas;
- [ ] Deve ser possível o usuário buscar academias pelo nome;
- [ ] Deve ser possível o usuário realizar check-in em uma academia;
- [ ] Deve ser possível validar o check-in de um usuário;
- [ ] Deve ser possível cadastrar uma academia;

## RNs (Regras de negócio)

- [ ] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [ ] O usuário não pode fazer 2 check-ins no mesmo dia;
- [ ] O usuário não pode fazer check-in se não estiver perto (100m) da academia;
- [ ] O check-in só pode ser validado até 20 minutos após ser criado;
- [ ] O check-in só pode ser validado por administradores;
- [ ] A academia só pode ser cadastrada por administradores;

## RNFs (Requisitos não-funcionais)

- [ ] A senha do usuário precisa estar criptografada;
- [ ] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [ ] Todas listas de dados precisam estar paginadas com 20 itens por página;
- [ ] O usuário deve ser identificado por um JWT (JSON Web Token);

# API SOLID

API desenvolvida seguindo os princípios SOLID e utilizando injeção de dependência com TSyringe.

## Arquitetura

A arquitetura está organizada nas seguintes camadas:

### Repositórios
Responsáveis pela persistência dos dados. Implementam interfaces bem definidas que permitem a troca de implementação sem afetar o restante do código.

### Serviços
Contêm a lógica de negócio da aplicação. Utilizam os repositórios para acessar os dados e aplicam as regras de negócio sobre eles.

### Controllers
Recebem as requisições HTTP, validam os dados de entrada e chamam os serviços apropriados.

### Presenters
Formatam os dados de saída para o formato adequado para o cliente.

## Injeção de Dependência

Utilizamos o TSyringe para injeção de dependência, permitindo:

1. **Desacoplamento**: As classes não instanciam suas dependências diretamente
2. **Testabilidade**: Facilita a criação de mocks para testes
3. **Manutenção**: Centraliza a criação de objetos

### Container

O arquivo `container.ts` registra todas as dependências no container do TSyringe. Ele é inicializado no início da aplicação (em `app.ts`).

### Factories

As factories são utilizadas para obter instâncias dos controllers a partir do container do TSyringe, encapsulando a lógica de criação.

## Estrutura de Arquivos

```
src/
├── container.ts             # Configuração do container de injeção de dependência
├── http/
│   ├── controllers/         # Controllers da aplicação
│   │   ├── factories/       # Factories para criação de controllers
│   │   └── interfaces/      # Interfaces dos controllers
│   └── routes/              # Rotas da aplicação
├── repositories/            # Repositórios para acesso aos dados
│   └── interfaces/          # Interfaces dos repositórios
├── services/                # Serviços com a lógica de negócio
│   └── interfaces/          # Interfaces dos serviços
├── presenters/              # Formatadores de resposta
└── types/                   # Tipos e DTOs
```