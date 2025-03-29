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

API desenvolvida seguindo os princípios SOLID, Domain-Driven Design (DDD) e Clean Architecture com injeção de dependência via TSyringe.

## Arquitetura

A arquitetura está organizada nas seguintes camadas:

### Repositórios
Responsáveis pela persistência dos dados. Implementam interfaces bem definidas que permitem a troca de implementação sem afetar o restante do código.

### Use Cases
Implementam a lógica de negócio da aplicação de forma modular. Cada use case é responsável por uma única operação bem definida, seguindo o princípio de responsabilidade única (SRP).

### Controllers
Recebem as requisições HTTP, validam os dados de entrada e delegam para os use cases apropriados.

### Presenters
Formatam os dados de saída para o formato adequado para o cliente.

### Mappers
Convertem entre diferentes representações de dados (entidades, DTOs), mantendo a separação entre as camadas.

## Tratamento de Erros

Utilizamos o padrão funcional Either para lidar com erros de forma explícita:

- `Left<Error>` - Representa falhas ou erros no processamento
- `Right<Result>` - Representa o sucesso e contém o resultado da operação

Este padrão nos permite tratar erros como valores de primeira classe, tornando o código mais previsível e testável.

## Injeção de Dependência

Utilizamos o TSyringe para injeção de dependência, permitindo:

1. **Desacoplamento**: As classes não instanciam suas dependências diretamente
2. **Testabilidade**: Facilita a criação de mocks para testes
3. **Manutenção**: Centraliza a criação de objetos

### Container

O arquivo `container.ts` registra todas as dependências no container do TSyringe. Ele é inicializado no início da aplicação (em `app.ts`).

### Factories

As factories são utilizadas para obter instâncias dos controllers e use cases a partir do container do TSyringe, encapsulando a lógica de criação.

## Estrutura de Arquivos

```
src/
├── container.ts              # Configuração do container de injeção de dependência
├── http/
│   ├── controllers/          # Controllers da aplicação
│   │   ├── factories/        # Factories para criação de controllers
│   │   └── interfaces/       # Interfaces dos controllers
│   ├── errors/               # Definições de erros da aplicação
│   │   └── interface/        # Interfaces para erros
│   └── routes/               # Rotas da aplicação
├── repositories/             # Repositórios para acesso aos dados
│   └── interfaces/           # Interfaces dos repositórios
├── use-cases/                # Use cases (casos de uso) da aplicação
│   ├── factories/            # Factories para criação de use cases
│   └── users/                # Use cases específicos para usuários
├── presenters/               # Formatadores de resposta
├── utils/                    # Utilitários, como mappers
└── types/                    # Tipos, DTOs e estruturas de dados
    └── either.ts             # Implementação do padrão Either
```

## Padrões Implementados

1. **Repository Pattern**: Abstrai o acesso a dados através de interfaces
2. **Dependency Injection**: Utiliza TSyringe para injeção de dependências
3. **Factory Pattern**: Encapsula criação de objetos complexos
4. **Use Case Pattern**: Encapsula lógica de negócio em unidades coesas
5. **Either Pattern**: Tratamento funcional de erros
6. **Mapper Pattern**: Conversão entre diferentes representações de dados
7. **Presenter Pattern**: Formatação de dados para apresentação

## Benefícios da Arquitetura

- **Modularidade**: Componentes bem definidos com responsabilidades claras
- **Testabilidade**: Fácil criar testes unitários com mocks
- **Escalabilidade**: Novos features podem ser adicionados sem modificar código existente
- **Manutenibilidade**: Código organizado e fácil de entender
- **Robustez**: Tratamento de erros explícito e consistente