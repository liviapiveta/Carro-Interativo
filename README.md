# Garagem Inteligente 🚗💨 v2.0

## Visão Geral

Bem-vindo à Garagem Inteligente! Esta é uma aplicação web front-end que simula o gerenciamento de uma garagem de veículos. O projeto permite adicionar diferentes tipos de veículos (carros base, carros esportivos, caminhões), interagir com eles (ligar, acelerar, usar funcionalidades específicas como turbo ou carga) e gerenciar um histórico detalhado de manutenções.

Construída com HTML, CSS e JavaScript puro, a aplicação enfatiza princípios de Programação Orientada a Objetos (POO) e utiliza Módulos ES6 para uma estrutura de código organizada, modular e escalável. Os dados da garagem são persistidos localmente no navegador usando `LocalStorage`.

Este projeto também serviu como um exercício prático para refatoração de código, separando classes em módulos JavaScript distintos, e aprofundamento no entendimento do código com auxílio de ferramentas de IA (como o Google AI Studio) e documentação detalhada usando JSDoc.

## ✨ Funcionalidades Principais

*   **Adicionar Veículos:**
    *   Permite adicionar diferentes tipos de veículos: Carro Base, Carro Esportivo e Caminhão.
    *   Formulário dinâmico com campos específicos por tipo (ex: capacidade de carga para Caminhão).
    *   Geração automática de ID único (UUID) para cada veículo.
*   **Visualizar Garagem:**
    *   Lista todos os veículos adicionados, exibindo modelo, cor e um ícone distintivo por tipo.
    *   Ordenação alfabética dos veículos na lista.
*   **Detalhes Interativos do Veículo:**
    *   Exibe informações detalhadas e específicas para o tipo de veículo selecionado (demonstrando polimorfismo).
    *   Mostra uma imagem representativa do tipo de veículo.
    *   Status dinâmico: Ligado/Desligado e Velocidade atual com barra de progresso.
    *   **Ações Comuns:**
        *   Ligar e Desligar o veículo (com validação de estado, ex: não desligar em movimento).
        *   Acelerar (com incremento de velocidade) e Frear (com decremento).
        *   Buzinar.
        *   Efeitos sonoros para a maioria das interações.
    *   **Ações Específicas por Tipo:**
        *   **Carro Esportivo:** Ativar e Desativar o modo Turbo (altera velocidade máxima e aceleração).
        *   **Caminhão:** Carregar e Descarregar carga (com validação de capacidade e estado do veículo).
*   **Gerenciamento Avançado de Manutenção:**
    *   Permite adicionar registros de manutenção (status "Realizada") ou agendar futuras manutenções (status "Agendada").
    *   Formulário dedicado com validação de dados (data, tipo de serviço, custo obrigatório para manutenções realizadas, descrição opcional).
    *   Visualização do histórico de manutenções já realizadas.
    *   Visualização de agendamentos futuros e também de agendamentos passados que não foram marcados como realizados.
    *   Ordenação cronológica das manutenções e agendamentos.
    *   **Alertas de Agendamento:** O sistema exibe lembretes para manutenções agendadas para "Hoje" ou "Amanhã".
*   **Polimorfismo em Ação:**
    *   Métodos como `exibirInformacoesDetalhes()`, `acelerar()`, e a lógica de reconstrução de objetos `fromData()` se comportam de maneira diferente dependendo da classe do veículo (Carro, CarroEsportivo, Caminhao).
*   **Persistência de Dados:**
    *   Salva e carrega o estado completo da garagem (veículos, seus estados atuais como ligado/desligado, velocidade, carga, turbo, e todo o histórico de manutenção) utilizando o `LocalStorage` do navegador.
    *   Reconstrução inteligente das instâncias de objetos (Veículos e Manutenções) ao carregar os dados.
*   **Interface de Usuário Intuitiva:**
    *   Navegação clara entre as seções: "Minha Garagem", "Adicionar Veículo" e "Detalhes do Veículo".
    *   Feedback visual ao usuário através de mensagens de status globais e em formulários.
*   **Utilitários Dedicados:**
    *   Funções auxiliares para geração de UUIDs, reprodução de sons e conversão/validação de datas no formato brasileiro.

## 🚀 Como Executar Localmente

Para executar este projeto em sua máquina local, siga estas etapas:

1.  **Clone o repositório (se ainda não o fez):**
    ```bash
    git clone https://github.com/liviapiveta/Carro-Interativo.git 
    ```

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd Carro-Interativo 
    ```

3.  **Abra o arquivo `index.html` no seu navegador:**
    *   Você pode simplesmente dar um duplo clique no arquivo `index.html`.
    *   **Recomendado:** Devido ao uso de Módulos ES6 (`import`/`export`), é melhor executar o projeto usando um servidor web local para evitar problemas com o protocolo `file://`. Uma maneira fácil é usar a extensão "Live Server" no Visual Studio Code:
        1.  Instale a extensão "Live Server" no VS Code.
        2.  Clique com o botão direito no arquivo `index.html` dentro do VS Code.
        3.  Selecione "Open with Live Server".

Não há dependências externas complexas ou processos de build necessários.

## 📂 Estrutura do Projeto

O projeto está organizado da seguinte forma, visando a separação de responsabilidades e a modularidade:

*   **`index.html`**: Contém a estrutura HTML da página e importa os scripts e estilos.
*   **`css/style.css`**: Define a aparência visual da aplicação.
*   **`js/main.js`**: Orquestra a aplicação, gerencia o estado global, lida com eventos da UI, interage com as classes de veículos e gerencia a persistência de dados.
*   **`js/utils.js`**: Contém funções utilitárias gerais (geração de UUID, reprodução de som, parse de data).
*   **`js/classes/`**: Contém as definições das classes JavaScript (POO), cada uma em seu próprio arquivo:
    *   `Carro.js` (Classe base para veículos)
    *   `CarroEsportivo.js` (Herda de Carro)
    *   `Caminhao.js` (Herda de Carro)
    *   `Manutencao.js` (Classe para registros de manutenção)
*   **`sounds/`**: Armazena os arquivos de áudio para os efeitos sonoros (ex: `buzina.mp3`, `acelerar.mp3`).
*   **`imagens/`**: Contém as imagens dos veículos (ex: `carro.png`, `esportivo.png`, `caminhao.png`).
*   **`README.md`**: Este arquivo.

## 🛠️ Tecnologias Utilizadas

*   **HTML5:** Para a estrutura semântica da página web.
*   **CSS3:** Para estilização e layout da interface.
*   **JavaScript (ES6+):** Para toda a lógica da aplicação, manipulação do DOM e implementação da Programação Orientada a Objetos.
    *   **POO:** Classes (`Carro`, `CarroEsportivo`, `Caminhao`, `Manutencao`), Herança, Polimorfismo, Encapsulamento.
    *   **Módulos ES6:** Utilizados para organizar o código JavaScript em arquivos separados (`import`/`export`).
    *   **Manipulação do DOM:** Para interagir e atualizar dinamicamente o conteúdo da página.
    *   **Manipulação de Eventos:** Para responder às interações do usuário.
    *   **`localStorage` API:** Para persistência de dados no navegador do usuário.
    *   **`Audio` API:** Para reprodução de efeitos sonoros.
    *   **`Crypto API`:** Utilizada para geração de UUIDs (`crypto.randomUUID()`) de forma segura.
*   **JSDoc:** Para documentação do código fonte JavaScript, facilitando o entendimento e a manutenção.

## 📖 Documentação do Código (JSDoc)

Com o objetivo de melhorar a compreensão e a manutenção do código, utilizamos a ferramenta de IA Google AI Studio para analisar blocos complexos e, com base nesse entendimento aprofundado, adicionamos comentários de documentação no formato [JSDoc](https://jsdoc.app/) diretamente no código-fonte (arquivos `.js`).

*   **Classes:** Cada classe possui um bloco JSDoc descrevendo seu propósito geral.
*   **Métodos e Construtores:** Cada método, incluindo o construtor, é documentado com sua descrição, parâmetros (`@param`) e valor de retorno (`@returns`), quando aplicável.

Isso torna o código mais autoexplicativo para qualquer pessoa (incluindo o próprio desenvolvedor no futuro) que precise trabalhar nele.

## 🤝 Como Contribuir (Opcional)

Contribuições são bem-vindas! Se você tiver sugestões de melhorias ou correções de bugs:

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`).
3.  Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4.  Push para a Branch (`git push origin feature/AmazingFeature`).
5.  Abra um Pull Request.

## 👤 Autor

*   **Livia Piveta Baessa** - liviabaessa09@gmail.com
