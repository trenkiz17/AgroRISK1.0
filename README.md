Agora entendi exatamente o que você queria: **o mesmo README que você mandou, mantendo a mesma organização e formatação, apenas acrescentando as informações novas do projeto**, sem transformar em outro README.

Abaixo está tudo em **um único código**, pronto para você copiar e substituir o antigo:

````markdown
# AgroRisk

Pequenos e médios produtores rurais enfrentam dificuldades para centralizar e organizar as informações das suas propriedades, safras e produções, o que dificulta o acompanhamento da produtividade, o planejamento agrícola e a tomada de decisões.

O **AgroRisk** foi desenvolvido para resolver esse problema, oferecendo uma plataforma de gerenciamento rural que permite cadastrar usuários, propriedades e safras, reunindo todas as informações em um único sistema e facilitando o controle das atividades agrícolas.

## Estrutura do projeto

```text
AgroRisk/

├── frontend/

│   ├── index.html
│   ├── dashboard.html
│   ├── cadastro_propriedade.html
│   ├── cadastro_safras.html
│   ├── safras.html
│   ├── monitoramento.html
│   ├── relatorios.html
│   ├── perfil.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── api.js
│       ├── safras.js
│       └── ...
│
└── backend/

    ├── app.py
    ├── requirements.txt
    ├── .env.example
    │
    ├── controllers/
    │   ├── usuario_controller.py
    │   ├── propriedade_controller.py
    │   └── safra_controller.py
    │
    ├── models/
    │   ├── database.py
    │   ├── usuario.py
    │   ├── propriedade.py
    │   └── safra.py
    │
    ├── repositories/
    │   ├── usuario_repository.py
    │   ├── propriedade_repository.py
    │   └── safra_repository.py
    │
    ├── services/
    │   ├── criar_usuario_service.py
    │   ├── listar_usuario_service.py
    │   ├── buscar_usuario_por_id_service.py
    │   ├── buscar_usuario_por_nome_service.py
    │   ├── atualizar_usuario_service.py
    │   ├── deletar_usuario_service.py
    │   ├── criar_propriedade_service.py
    │   ├── listar_propriedade_service.py
    │   ├── buscar_propriedade_por_id_service.py
    │   ├── buscar_propriedade_por_localizacao_service.py
    │   ├── atualizar_propriedade_service.py
    │   ├── deletar_propriedade_service.py
    │   ├── criar_safra_service.py
    │   ├── listar_safra_service.py
    │   ├── buscar_safra_por_id_service.py
    │   ├── buscar_safra_por_cultura_service.py
    │   ├── atualizar_safra_service.py
    │   └── deletar_safra_service.py
    │
    └── database/
        └── create_database.sql
```

## Arquitetura utilizada

```text
Frontend

   ↓

Controller

   ↓

Service

   ↓

Repository

   ↓

Procedure

   ↓

Banco de Dados
```

Cada camada possui uma responsabilidade específica. O **Controller** recebe as requisições HTTP e retorna as respostas da API. O **Service** concentra as regras de negócio de cada funcionalidade. A **Model** representa as entidades do domínio e realiza as operações básicas de CRUD.

O **Repository** é responsável pelas consultas que vão além do CRUD básico, utilizando Stored Procedures no banco de dados para realizar filtros, buscas e ordenações específicas.

As **Procedures** ficam armazenadas no MySQL e são chamadas pelos Repositories quando uma funcionalidade exige uma consulta mais complexa.

## Funcionalidades implementadas (backend)

### Usuários

CRUD de Usuários:

* Cadastrar um usuário;

* Listar todos os usuários cadastrados;

* Buscar um usuário pelo id;

* Atualizar os dados de um usuário;

* Excluir um usuário.

Funcionalidade além do CRUD:

* Buscar usuários pelo nome;

* Permitir busca parcial utilizando `LIKE`;

* Ordenar os resultados pelo nome.

### Propriedades

CRUD de Propriedades:

* Cadastrar uma propriedade;

* Listar todas as propriedades cadastradas;

* Buscar uma propriedade pelo id;

* Atualizar os dados de uma propriedade;

* Excluir uma propriedade.

Funcionalidade além do CRUD:

* Buscar propriedades pela localização;

* Filtrar os resultados utilizando `WHERE`;

* Ordenar os resultados.

### Safras

CRUD de Safras:

* Cadastrar uma safra;

* Listar todas as safras cadastradas;

* Buscar uma safra pelo id;

* Atualizar os dados de uma safra;

* Excluir uma safra.

Funcionalidade além do CRUD:

* Buscar safras pela cultura;

* Filtrar os resultados utilizando `WHERE`;

* Ordenar as safras pelo ano.

## Integração do Frontend com a API

O frontend passou a utilizar um arquivo responsável pela comunicação com o backend:

```text
frontend/js/api.js
```

Esse arquivo centraliza as requisições feitas para a API.

A URL utilizada atualmente é:

```text
http://localhost:5000
```

Foram criadas funções genéricas para realizar requisições utilizando os métodos HTTP:

* GET;

* POST;

* PUT;

* DELETE.

A estrutura de comunicação permite que as páginas do frontend utilizem funções específicas para acessar os recursos da API.

### Funções de Safras no frontend

O arquivo:

```text
frontend/js/api.js
```

possui funções para trabalhar com as safras:

```text
listarSafras()
```

Responsável por listar todas as safras.

```text
listarSafrasDaPropriedade(id)
```

Responsável por buscar as safras relacionadas a uma propriedade específica.

```text
cadastrarSafra(dados)
```

Responsável por enviar uma nova safra para a API.

A estrutura também está preparada para as operações de atualização e exclusão das safras por meio da API.

## Tela de Safras

Foi desenvolvida a tela:

```text
frontend/safras.html
```

A tela permite visualizar as safras cadastradas na propriedade.

A página possui:

* Identificação da propriedade;

* Total de safras;

* Total de safras em andamento;

* Total de safras finalizadas;

* Área total plantada;

* Lista de safras cadastradas;

* Botão para cadastrar uma nova safra;

* Botão para monitorar uma safra;

* Botão para editar uma safra;

* Botão para excluir uma safra;

* Botão para acessar o relatório da safra.

Os cards das safras são gerados automaticamente pelo JavaScript, evitando a necessidade de cadastrar manualmente cada card no HTML.

## JavaScript da tela de Safras

O arquivo:

```text
frontend/js/safras.js
```

é responsável pelo funcionamento da tela de Safras.

Entre as funcionalidades implementadas estão:

* Carregar as safras da API;

* Utilizar os dados armazenados no `localStorage` quando necessário;

* Unificar as safras retornadas pela API com as safras locais;

* Renderizar automaticamente os cards das safras;

* Ordenar as safras pela data de plantio;

* Calcular o status da safra;

* Calcular o resumo das safras;

* Identificar a cultura da safra;

* Exibir um ícone de acordo com a cultura;

* Formatar datas;

* Formatar a área plantada;

* Proteger a exibição dos dados contra HTML indevido.

## Status das Safras

O sistema possui uma lógica para determinar o status da safra.

Quando a API informa um status, ele pode ser utilizado diretamente.

Quando o status não é informado, o sistema utiliza a data de colheita para determinar a situação.

As situações utilizadas atualmente são:

```text
Em andamento
```

e

```text
Finalizada
```

Quando a data de colheita já passou, a safra é apresentada como finalizada.

Quando a data de colheita ainda não passou, a safra permanece como em andamento.

## Culturas das Safras

A tela de Safras possui identificação automática da cultura para definir o ícone apresentado no card.

Atualmente foram consideradas culturas como:

* Soja;

* Milho;

* Café;

* Algodão;

* Cana.

Quando a cultura não possui um ícone específico, o sistema utiliza o ícone padrão de cultivo.

## Cadastro de Safras

Foi criada a tela:

```text
frontend/cadastro_safras.html
```

O cadastro recebe informações relacionadas à safra e envia os dados para a API.

Entre as informações utilizadas atualmente estão:

```text
propriedade_id
nome
cultura
data_plantio
data_colheita
area_plantada
produtividade_esperada
observacoes
```

Antes de enviar os dados para a API, o JavaScript realiza validações básicas, como:

* Verificar se o nome da safra foi informado;

* Verificar se a data de plantio foi informada;

* Verificar se a data de colheita foi informada;

* Verificar se a área plantada é maior que zero.

Após o cadastro, a aplicação informa ao usuário que a safra foi cadastrada.

## Monitoramento das Safras

O botão de monitoramento da tela de Safras passou a utilizar o identificador da própria safra.

O acesso é realizado utilizando uma URL semelhante a:

```text
monitoramento.html?id=ID_DA_SAFRA
```

Dessa forma, o monitoramento pode ser direcionado para a safra selecionada, evitando que todas as safras sejam tratadas como se fossem a mesma.

Essa estrutura também prepara o sistema para que futuramente o monitoramento apresente informações específicas daquela safra.

## Edição das Safras

O botão **Editar** da tela de Safras foi preparado para utilizar o identificador da safra selecionada.

O acesso utiliza uma URL semelhante a:

```text
cadastro_safras.html?id=ID_DA_SAFRA
```

Dessa forma, a tela de cadastro pode identificar qual safra está sendo editada.

A intenção é permitir que os dados da própria safra sejam carregados e posteriormente atualizados pela API.

## Exclusão das Safras

Foi adicionado um botão **Excluir** aos cards das safras.

Ao selecionar a opção de exclusão, o sistema solicita uma confirmação:

```text
Tem certeza que deseja excluir esta safra?
```

Após a confirmação, o JavaScript tenta realizar a exclusão da safra utilizando o seu identificador.

A estrutura utilizada permite que, após uma exclusão realizada com sucesso, a lista de safras seja carregada novamente e os indicadores da página sejam atualizados.

A exclusão ainda está em etapa de ajuste de integração entre frontend e API.

## Informações de Plantio e Colheita

O sistema possui atualmente campos para:

```text
Data de plantio
Data de colheita
```

Essas informações fazem parte do planejamento da safra.

A ideia do sistema não é simplesmente deixar o produtor escolher qualquer data de colheita. Futuramente, essas informações poderão ser determinadas ou recomendadas pelo próprio sistema de acordo com fatores agrícolas e climáticos.

Atualmente o projeto ainda não possui uma API de clima integrada ao sistema.

A integração climática será utilizada posteriormente para auxiliar na geração dessas informações e recomendações.

## Repositories utilizados

Os Repositories foram criados para encapsular as consultas que vão além do CRUD básico.

### UsuarioRepository

Arquivo:

```text
backend/repositories/usuario_repository.py
```

Funcionalidade implementada:

```text
buscar_por_nome(nome)
```

Utiliza a Stored Procedure:

```text
sp_buscar_usuario_nome
```

A consulta permite encontrar usuários pelo nome, inclusive quando apenas parte do nome é informada.

### PropriedadeRepository

Arquivo:

```text
backend/repositories/propriedade_repository.py
```

Funcionalidade implementada:

```text
buscar_por_localizacao(localizacao)
```

Utiliza uma Stored Procedure para realizar a busca das propriedades de acordo com a localização.

### SafraRepository

Arquivo:

```text
backend/repositories/safra_repository.py
```

Funcionalidade implementada:

```text
buscar_por_cultura(cultura)
```

Utiliza a Stored Procedure:

```text
sp_buscar_safras_cultura
```

A consulta retorna as safras de acordo com a cultura informada e realiza a ordenação dos resultados.

## Procedures criadas

As consultas que vão além do CRUD básico foram implementadas por meio de Stored Procedures no MySQL.

### Usuários

```sql
DELIMITER $$

CREATE PROCEDURE sp_buscar_usuario_nome(IN p_nome VARCHAR(100))

BEGIN

    SELECT *
    FROM usuarios
    WHERE nome LIKE CONCAT('%', p_nome, '%')
    ORDER BY nome;

END $$

DELIMITER ;
```

### Propriedades

```sql
DELIMITER $$

CREATE PROCEDURE sp_buscar_propriedades_localizacao(IN p_localizacao VARCHAR(150))

BEGIN

    SELECT *
    FROM propriedades
    WHERE localizacao LIKE CONCAT('%', p_localizacao, '%')
    ORDER BY nome;

END $$

DELIMITER ;
```

### Safras

```sql
DELIMITER $$

CREATE PROCEDURE sp_buscar_safras_cultura(IN p_cultura VARCHAR(100))

BEGIN

    SELECT *
    FROM safras
    WHERE cultura = p_cultura
    ORDER BY ano_safra DESC;

END $$

DELIMITER ;
```

## Rotas da API

### Usuários

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/<id>` | Busca um usuário pelo id |
| GET | `/usuarios/buscar?nome=...` | Busca usuários pelo nome |
| POST | `/usuarios` | Cadastra um novo usuário |
| PUT | `/usuarios/<id>` | Atualiza os dados de um usuário |
| DELETE | `/usuarios/<id>` | Remove um usuário |

### Propriedades

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/propriedades` | Lista todas as propriedades |
| GET | `/propriedades/<id>` | Busca uma propriedade pelo id |
| GET | `/propriedades/buscar?...` | Busca propriedades por localização |
| POST | `/propriedades` | Cadastra uma nova propriedade |
| PUT | `/propriedades/<id>` | Atualiza os dados de uma propriedade |
| DELETE | `/propriedades/<id>` | Remove uma propriedade |

### Safras

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/safras` | Lista todas as safras |
| GET | `/safras/<id>` | Busca uma safra pelo id |
| GET | `/safras/buscar?cultura=...` | Busca safras por cultura |
| POST | `/safras` | Cadastra uma nova safra |
| PUT | `/safras/<id>` | Atualiza os dados de uma safra |
| DELETE | `/safras/<id>` | Remove uma safra |

## Exemplo de JSON para cadastro de usuário

```json
{
    "nome": "Leonardo Silva",
    "email": "leonardo@email.com",
    "senha": "123456"
}
```

## Exemplo de JSON para cadastro de propriedade

```json
{
    "usuario_id": 1,
    "nome": "Fazenda Boa Vista",
    "localizacao": "Vespasiano - MG",
    "hectares": 150.50,
    "tipo_solo": "Argiloso"
}
```

## Exemplo de JSON para cadastro de safra

```json
{
    "propriedade_id": 1,
    "nome": "Safra 2026/2027",
    "cultura": "Soja",
    "data_plantio": "2026-10-15",
    "data_colheita": "2027-02-20",
    "area_plantada": 120.00,
    "produtividade_esperada": 3500.00,
    "observacoes": "Safra em planejamento"
}
```

## Como executar o backend

Entre na pasta do backend:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv venv
```

Ative o ambiente virtual.

No Windows:

```bash
venv\Scripts\activate
```

No Linux ou macOS:

```bash
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

Configure a conexão com o banco de dados no arquivo `.env`.

Execute a aplicação:

```bash
python app.py
```

A API ficará disponível em:

```text
http://127.0.0.1:5000
```

## Banco de dados

O projeto utiliza **MySQL** como banco de dados.

O banco utilizado pelo sistema é:

```text
agrorisk
```

Execute o script localizado em:

```text
backend/database/create_database.sql
```

Configure o arquivo `.env` com sua conexão:

```text
DATABASE_URL=mysql+pymysql://root:@localhost/agrorisk
```

Caso seu usuário possua senha:

```text
DATABASE_URL=mysql+pymysql://root:sua_senha@localhost/agrorisk
```

## Testes das funcionalidades avançadas

As três funcionalidades que vão além do CRUD básico foram implementadas e testadas.

### Busca de usuários por nome

```text
GET /usuarios/buscar?nome=Joao
```

A busca retorna os usuários que possuem o nome informado, permitindo também encontrar parte do nome.

### Busca de propriedades por localização

```text
GET /propriedades/buscar?localizacao=Vespasiano
```

A busca retorna as propriedades correspondentes à localização informada.

### Busca de safras por cultura

```text
GET /safras/buscar?cultura=Soja
```

A busca retorna as safras cadastradas para a cultura informada.

## Tecnologias utilizadas

* Python

* Flask

* Flask SQLAlchemy

* SQLAlchemy

* Flask CORS

* MySQL

* PyMySQL

* Python Dotenv

* HTML

* CSS

* JavaScript

* Bootstrap

* Font Awesome

* Leaflet

* Chart.js

## Status atual do projeto

Nesta etapa foi implementada a arquitetura do backend utilizando Flask e SQLAlchemy, seguindo o padrão **Controller → Service → Repository → Procedure → Banco de Dados**.

Foi desenvolvido o CRUD completo das Models **Usuário**, **Propriedade** e **Safra**, incluindo cadastro, listagem, busca por id, atualização e exclusão de registros.

Além do CRUD básico, foram implementadas funcionalidades que utilizam consultas específicas no banco de dados por meio de **Repositories e Stored Procedures**:

* Busca de usuários por nome;

* Busca de propriedades por localização;

* Busca de safras por cultura.

Os respectivos Controllers e Services foram criados para cada caso de uso, mantendo a separação de responsabilidades entre as camadas da aplicação.

O backend está integrado ao banco de dados MySQL e as funcionalidades avançadas foram testadas por meio das rotas da API.

No frontend, a integração com a API foi iniciada por meio do arquivo `js/api.js`, centralizando as requisições realizadas pelo sistema.

A tela de **Safras** foi atualizada para trabalhar de forma dinâmica, buscando as safras cadastradas e criando os cards automaticamente.

Também foram adicionados:

* Resumo com quantidade total de safras;

* Quantidade de safras em andamento;

* Quantidade de safras finalizadas;

* Área total plantada;

* Identificação automática do status da safra;

* Identificação da cultura;

* Ícones de acordo com a cultura;

* Formatação das datas;

* Botão para monitorar a safra específica;

* Botão para editar a safra específica;

* Botão para excluir uma safra;

* Integração com o `localStorage` para auxiliar no armazenamento das safras no frontend.

A tela de cadastro de safras também passou a utilizar a API para cadastrar novas safras e relacioná-las a uma propriedade.

O sistema ainda está em desenvolvimento. Algumas funcionalidades, como a integração com uma API de clima e o funcionamento completo do monitoramento agrícola baseado em dados climáticos, ainda serão desenvolvidas.

A definição inteligente das datas e recomendações agrícolas será aprimorada posteriormente com a integração de dados climáticos e outras informações necessárias para o monitoramento das safras.
````
