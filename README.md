# App

GymPass style app.

## RFs (Requisitos funcionais)

- [x] Deve ser possível se cadastrar;
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível obter o perfil de um usuário logado;
- [x] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [x] Deve ser possível o usuário obter o seu histórico de check-ins;
- [x] Deve ser possível o usuário buscar academias próximas (até 10km);
- [x] Deve ser possível o usuário buscar academias pelo nome;
- [x] Deve ser possível o usuário realizar check-in em uma academia;
- [x] Deve ser possível validar o check-in de um usuário;
- [x] Deve ser possível cadastrar uma academia;

## RNs (Regras de negócio)

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [x] O usuário não pode fazer 2 check-ins no mesmo dia;
- [x] O usuário não pode fazer check-in se não estiver perto (100m) da academia;
- [x] O check-in só pode ser validado até 20 minutos após ser criado;
- [ ] O check-in só pode ser validado por administradores;
- [ ] A academia só pode ser cadastrada por administradores;

## RNFs (Requisitos não-funcionais)

- [x] A senha do usuário precisa estar criptografada;
- [x] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [x] Todas listas de dados precisam estar paginadas com 20 itens por página;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token) assinado com o algoritmo assimétrico RS256 para maior segurança;

# API SOLID

API desenvolvida seguindo os princípios SOLID, Domain-Driven Design (DDD) e Clean Architecture com injeção de dependência via TSyringe.

## Testes

A aplicação implementa testes unitários para garantir a integridade dos casos de uso e regras de negócio:

### Testes Unitários
Utilizamos o padrão InMemoryRepository para os testes unitários, permitindo testar os casos de uso sem dependência do banco de dados real. 

Os testes unitários verificam:
- Regras de negócio (como validação de email duplicado)
- Transformação de dados (como hash de senha)
- Fluxos de sucesso e erro
Recentemente, os testes foram aprimorados para maior robustez, cobrindo mais cenários de borda e validações.

### Repositórios InMemory
Implementamos repositórios em memória (InMemoryRepository) para cada entidade, simulando o comportamento dos repositórios reais sem a necessidade de um banco de dados. Isso permite:
- Testes mais rápidos
- Independência de infraestrutura externa
- Isolamento de problemas

## Arquitetura

A arquitetura está organizada nas seguintes camadas:

### Domains
Contém as entidades de domínio e interfaces dos repositórios, seguindo o princípio de inversão de dependência.

### Application
Implementa os casos de uso (use cases) que contêm a lógica de negócio da aplicação. Também inclui DTOs e validações.

### Infrastructure
Contém implementações concretas como repositórios, controllers, factories e configurações de banco de dados.

### Shared
Componentes compartilhados entre diferentes partes da aplicação, como utilities, erros e presenters.

## Segurança

A aplicação implementa várias camadas de segurança:

### Autenticação com JWT RS256

Utilizamos JSON Web Tokens (JWT) com o algoritmo de assinatura assimétrica RS256 para autenticação:

- **Segurança Avançada**: Diferente do algoritmo simétrico HS256 (que usa uma única chave secreta), o RS256 utiliza um par de chaves público/privada.
- **Assinatura Assimétrica**: A chave privada (guardada no servidor) assina o token, enquanto a chave pública pode verificar a autenticidade do token.
- **Vantagens de Segurança**:
  - Apenas o servidor precisa manter a chave privada segura
  - Serviços externos podem verificar tokens usando apenas a chave pública
  - Maior resistência a ataques de força bruta

### Proteção de Senhas

- Senhas são armazenadas utilizando hash bcrypt
- Não armazenamos senhas em texto puro em nenhum momento
- Comparações de senha são feitas de forma segura contra timing attacks

### Validação de Dados

- Todos os dados de entrada são validados usando schemas Zod
- Validações incluem verificações de formato, tamanho e valores permitidos

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
├── shared/                   # Componentes compartilhados
│   ├── errors/               # Definições de erros da aplicação
│   │   └── interfaces/       # Interfaces para erros
│   ├── presenters/           # Formatadores de resposta
│   └── utils/                # Utilitários, como mappers e Either
├── domains/                  # Camada de domínio
│   └── users/                # Domínio de usuários
│       └── repositories/     # Interfaces de repositórios
│           └── in-memory/    # Implementações em memória para testes
├── application/              # Camada de aplicação
│   └── users/                # Aplicação para usuários
│       ├── dtos/             # Data Transfer Objects
│       └── use-cases/        # Casos de uso com testes
├── infrastructure/           # Camada de infraestrutura
│   ├── database/             # Configuração de banco de dados
│   ├── controllers/          # Controllers da aplicação
│   │   └── interfaces/       # Interfaces dos controllers
│   ├── factories/            # Factories para criação de objetos
│   ├── http/                 # Configuração HTTP e rotas
│   └── repositories/         # Implementações concretas dos repositórios
└── container.ts              # Configuração do container de injeção de dependência
```

## Padrões Implementados

1. **Repository Pattern**: Abstrai o acesso a dados através de interfaces
2. **Dependency Injection**: Utiliza TSyringe para injeção de dependências
3. **Factory Pattern**: Encapsula criação de objetos complexos (e geração de dados de teste com Faker)
4. **Use Case Pattern**: Encapsula lógica de negócio em unidades coesas
5. **Either Pattern**: Tratamento funcional de erros
6. **InMemory Repository**: Repositórios em memória para testes unitários
7. **Mapper Pattern**: Conversão entre diferentes representações de dados
8. **Presenter Pattern**: Formatação de dados para apresentação

## Benefícios da Arquitetura

- **Modularidade**: Componentes bem definidos com responsabilidades claras
- **Testabilidade**: Testes unitários com repositórios InMemory
- **Escalabilidade**: Novos features podem ser adicionados sem modificar código existente
- **Manutenibilidade**: Código organizado e fácil de entender
- **Robustez**: Tratamento de erros explícito e consistente
