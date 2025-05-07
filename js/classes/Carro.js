/**
 * js/classes/Carro.js
 * Classe base para todos os veículos.
 */
import { Manutencao } from './Manutencao.js';
// Funções utilitárias serão importadas no main.js e passadas ou chamadas de lá
// import { uuidv4 } from '../utils.js'; // uuidv4 será chamado pelo código que cria o carro

export class Carro {
    /**
     * @param {string} modelo - Modelo do carro.
     * @param {string} cor - Cor do carro.
     * @param {string} id - ID único do veículo.
     */
    constructor(modelo, cor, id) { // ID é passado externamente agora
        if (!modelo || !cor || !id) throw new Error("ID, Modelo e Cor são obrigatórios.");
        this.id = id;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = 180;
        this.tipo = "carro";
        this.historicoManutencao = [];
    }

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * A validação deve ocorrer ANTES de chamar este método.
     * @param {Manutencao} manutencao - O objeto Manutencao validado a ser adicionado.
     * @returns {boolean} True se adicionado com sucesso, False caso contrário.
     */
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Tentativa de adicionar objeto que não é Manutencao.");
            // O chamador deve mostrar o erro na UI
            return false;
        }
        // Assume que manutencao.validar() já foi chamado e retornou true

        try {
            this.historicoManutencao.push(manutencao);
            // Ordena sempre por data após adicionar (mais recentes primeiro)
            this.historicoManutencao.sort((a, b) => {
                const dataA = a.getDataObj();
                const dataB = b.getDataObj();
                if (!dataA) return 1; // Inválidos no final
                if (!dataB) return -1; // Inválidos no final
                // Ordena por data descendente (mais recente primeiro)
                return dataB.getTime() - dataA.getTime();
            });
            console.log(`Manutenção (${manutencao.status}) adicionada ao ${this.modelo}: ${manutencao.tipo}`);
            // O chamador deve chamar salvarGaragem()
            return true;
        } catch (error) {
            console.error("Erro ao adicionar ou ordenar manutenção:", error);
            // O chamador deve mostrar o erro na UI
            return false;
        }
    }

    /**
     * Retorna o histórico de manutenção formatado e separado por status.
     * @returns {{realizadas: string[], futuras: string[], passadas: string[]}} Objeto com listas de manutenções formatadas.
     */
    getHistoricoFormatado(parsePtBrDateFn) { // Recebe a função de parse como argumento
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0); // Zera horas UTC para comparar só a data

        const realizadas = [];
        const futuras = [];
        const passadasAgendadas = []; // Agendamentos cuja data já passou

        this.historicoManutencao.forEach(m => {
            const dataManutencao = m.getDataObj(); // Já retorna em UTC
            const textoFormatado = m.formatar(); // Usa a formatação da própria classe

            if (m.status === 'Realizada') {
                realizadas.push(textoFormatado);
            } else if (m.status === 'Agendada') {
                if (dataManutencao) {
                     dataManutencao.setUTCHours(0, 0, 0, 0); // Garante comparação UTC
                     if (dataManutencao >= hoje) {
                         futuras.push(textoFormatado);
                     } else {
                         passadasAgendadas.push(textoFormatado);
                     }
                 } else {
                     // Data inválida, tratar como passada? Ou erro? Colocando em passadas.
                     passadasAgendadas.push(textoFormatado + " [Data Inválida]");
                 }
            }
        });

        // Ordena agendamentos futuros por data (mais próxima primeiro)
         // Para ordenar corretamente, precisamos do objeto Date, não da string formatada.
         // Re-busca os objetos Manutencao correspondentes às strings futuras.
         const futurasObj = this.historicoManutencao.filter(m =>
             m.status === 'Agendada' && m.getDataObj() && m.getDataObj() >= hoje
         );
         futurasObj.sort((a, b) => {
             const dataA = a.getDataObj();
             const dataB = b.getDataObj();
             // Não precisa checar null aqui pois já foram filtrados
             return dataA.getTime() - dataB.getTime(); // Ascendente (mais próxima primeiro)
         });
         // Mapeia de volta para strings formatadas após ordenar
         const futurasOrdenadas = futurasObj.map(m => m.formatar());


        return { realizadas, futuras: futurasOrdenadas, passadas: passadasAgendadas };
    }

    ligar() {
        if (this.ligado) {
            // Lança erro para o chamador tratar (mostrar UI)
            throw new Error("O carro já está ligado!");
        }
        this.ligado = true;
        // O chamador deve: playSound, atualizarStatusVisual, salvarGaragem, mostrarStatusGlobal
        console.log(`${this.modelo} ligado!`);
        return true; // Indica sucesso
    }

    desligar() {
        if (!this.ligado) {
            throw new Error("O carro já está desligado!");
        }
        if (this.velocidade > 0) {
            throw new Error("Pare o carro completamente antes de desligar!");
        }
        this.ligado = false;
        this.velocidade = 0; // Garantir
        // O chamador deve: playSound, atualizarStatusVisual, salvarGaragem, mostrarStatusGlobal
        console.log(`${this.modelo} desligado!`);
        return true; // Indica sucesso
    }

    acelerar(incremento) {
        if (!this.ligado) {
            throw new Error("Ligue o carro para acelerar.");
        }
        if (typeof incremento !== 'number' || incremento <= 0) {
            console.warn("Incremento de aceleração inválido:", incremento);
            incremento = 10; // Valor padrão
        }
        const novaVelocidade = this.velocidade + incremento;
        this.velocidade = Math.min(novaVelocidade, this.velocidadeMaxima);

        // O chamador deve: playSound, atualizarStatusVisual
        // O chamador decide quando salvarGaragem (ex: ao parar)
        console.log(`Velocidade de ${this.modelo}: ${this.velocidade} km/h`);
        return this.velocidade; // Retorna nova velocidade
    }

    frear(decremento) {
        if (this.velocidade === 0) {
             return 0; // Já parado, sem ação ou erro
        }
        if (typeof decremento !== 'number' || decremento <= 0) {
             console.warn("Decremento de frenagem inválido:", decremento);
             decremento = 10; // Valor padrão
        }
        this.velocidade = Math.max(0, this.velocidade - decremento);

        // O chamador deve: playSound, atualizarStatusVisual
        // O chamador deve: salvarGaragem e mostrarStatusGlobal se velocidade chegar a 0
        console.log(`Velocidade de ${this.modelo}: ${this.velocidade} km/h`);
        return this.velocidade; // Retorna nova velocidade
    }

    buzinar() {
        // O chamador deve: playSound, mostrarStatusGlobal
        console.log(`${this.modelo} buzinou: Beep beep!`);
        // Buzinar não altera estado, então não precisa retornar nada específico ou salvar.
    }

    /**
     * Retorna uma string HTML com as informações básicas do veículo.
     * @returns {string} HTML com as informações.
     */
    exibirInformacoesBase() {
        return `
             ID: ${this.id}<br>
             Modelo: ${this.modelo}<br>
             Cor: ${this.cor}<br>
             Tipo: ${this.tipo.charAt(0).toUpperCase() + this.tipo.slice(1)}<br>
             Velocidade Máxima: ${this.velocidadeMaxima} km/h`;
    }

    /**
     * Retorna a string HTML completa para exibição nos detalhes.
     * Pode ser sobrescrito por classes filhas.
     * @returns {string} HTML com todas as informações relevantes.
     */
    exibirInformacoesDetalhes() {
        return this.exibirInformacoesBase();
    }

    /**
     * Retorna a descrição curta para a lista de veículos.
     * @returns {string} Descrição para a lista.
     */
    getDescricaoLista() {
        return `${this.modelo} (${this.cor})`;
    }

    /**
     * Recria uma instância de Carro a partir de dados puros (LocalStorage).
     * @param {object} data - Objeto com os dados do carro.
     * @returns {Carro} Instância recriada.
     */
    static fromData(data) {
        try {
            // ID é obrigatório agora no construtor
            const carro = new Carro(data.modelo, data.cor, data.id || uuidv4()); // Gera ID se faltar (migração)
            carro.ligado = data.ligado ?? false;
            carro.velocidade = data.velocidade ?? 0;
            carro.velocidadeMaxima = data.velocidadeMaxima ?? 180;
            // Recriar objetos Manutencao - Importante usar a classe Manutencao aqui!
            if (Array.isArray(data.historicoManutencao)) {
                carro.historicoManutencao = data.historicoManutencao
                    .map(m => new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status))
                    .filter(m => m instanceof Manutencao); // Garante que só instâncias válidas entrem
                 // Reordenar após carregar, caso a ordem salva esteja incorreta
                 carro.historicoManutencao.sort((a, b) => {
                     const dataA = a.getDataObj();
                     const dataB = b.getDataObj();
                     if (!dataA) return 1;
                     if (!dataB) return -1;
                     return dataB.getTime() - dataA.getTime();
                 });
            } else {
                carro.historicoManutencao = [];
            }
            return carro;
        } catch (error) {
            console.error("Erro ao recriar Carro a partir dos dados:", data, error);
            return null; // Retorna null para indicar falha na recriação
        }
    }
}