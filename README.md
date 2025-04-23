# Garagem Inteligente 🚗💨

## Visão Geral

Bem-vindo ao projeto Garagem Inteligente! Esta é uma aplicação web front-end desenvolvida para simular o gerenciamento de veículos em uma garagem. O projeto permite adicionar diferentes tipos de veículos (carros, motos, caminhões), registrar informações sobre eles e gerenciar registros de manutenção. A aplicação foi construída utilizando HTML, CSS e JavaScript puro, com forte ênfase em princípios de Programação Orientada a Objetos (POO) para uma estrutura de código organizada e escalável. Os dados são persistidos localmente no navegador usando `LocalStorage`.

Este projeto também serviu como um exercício prático para refatoração de código, separando classes em módulos JavaScript distintos, e aprofundamento no entendimento do código com auxílio de ferramentas de IA (como o Google AI Studio) e documentação detalhada usando JSDoc.

## ✨ Funcionalidades Principais

*   **Adicionar Veículos:** Permite adicionar diferentes tipos de veículos (Carro, Moto, Caminhão) com suas propriedades específicas.
*   **Visualizar Garagem:** Lista todos os veículos atualmente na garagem.
*   **Detalhes do Veículo:** Exibe informações detalhadas de um veículo selecionado.
*   **Gerenciamento de Manutenção:** Permite adicionar e visualizar registros de manutenção para cada veículo.
*   **Polimorfismo:** Demonstra o uso de polimorfismo através de métodos comuns (`interagir`) que se comportam de maneira diferente dependendo do tipo de veículo.
*   **Persistência de Dados:** Salva e carrega o estado da garagem utilizando o `LocalStorage` do navegador.
*   **Interface Interativa:** UI simples e funcional para interagir com a garagem.

## 🚀 Como Executar Localmente

Para executar este projeto em sua máquina local, siga estas etapas:

1.  **Clone o repositório:**
    ```bash
    [git clone https://github.com/seu-usuario/garagem-inteligente.git](https://github.com/liviapiveta/Carro-Interativo/tree/main)
    ```

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd garagem-inteligente
    ```

3.  **Abra o arquivo `index.html` no seu navegador:**
    *   Você pode simplesmente dar um duplo clique no arquivo `index.html`.
    *   Ou, se preferir (ou se encontrar problemas com módulos ES6 via `file://`), use uma extensão de servidor local como o "Live Server" no VS Code (clique com o botão direito no `index.html` e escolha "Open with Live Server").

Não há dependências externas ou processos de build complexos necessários.

## 📂 Estrutura do Projeto

O projeto está organizado da seguinte forma, visando a separação de responsabilidades e a modularidade:


*   **`index.html`**: Contém a estrutura básica da página e importa os scripts necessários.
*   **`css/style.css`**: Define a aparência visual da aplicação.
*   **`js/classes/`**: Contém as definições das classes JavaScript (POO), cada uma em seu próprio arquivo para melhor organização. A ordem de importação no `index.html` é importante (classes base antes das derivadas).
*   **`js/utils/`**: (Opcional) Pode conter funções auxiliares reutilizáveis, como as de manipulação do `LocalStorage`.
*   **`js/main.js`**: Orquestra a aplicação, lida com eventos da interface do usuário (cliques de botão, envios de formulário), instancia objetos das classes definidas e atualiza a UI.

## 🛠️ Tecnologias Utilizadas

*   **HTML5:** Para a estrutura semântica da página web.
*   **CSS3:** Para estilização e layout da interface.
*   **JavaScript (ES6+):** Para a lógica da aplicação, manipulação do DOM e implementação da Programação Orientada a Objetos (POO).
    *   **POO:** Classes, Herança, Polimorfismo, Encapsulamento.
    *   **Módulos ES6:** Utilizados para organizar o código JavaScript em arquivos separados (`import`/`export`).
*   **LocalStorage API:** Para persistência de dados no navegador do usuário.
*   **JSDoc:** Para documentação do código fonte JavaScript, facilitando o entendimento e a manutenção.

## 📖 Documentação do Código (JSDoc)

Com o objetivo de melhorar a compreensão e a manutenção do código, utilizamos a ferramenta de IA Google AI Studio para analisar blocos complexos e, com base nesse entendimento aprofundado, adicionamos comentários de documentação no formato [JSDoc](https://jsdoc.app/) diretamente no código-fonte (`.js` files).

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

## 📄 Licença (Opcional)

Este projeto está licenciado sob a Licença MIT - veja o arquivo `LICENSE` (se existir) para detalhes.

## 👤 Autor

*   **Livia Piveta Baessa** - liviabaessa09@gmail.com

---
