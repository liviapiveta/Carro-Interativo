/**
 * js/classes/Caminhao.js
 * Representa um Caminhão, herdando de Carro.
 */
import { Carro } from './Carro.js';
import { Manutencao } from './Manutencao.js'; // Necessário para fromData

export class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga, id) { // ID passado externamente
        super(modelo, cor, id);
        if (typeof capacidadeCarga !== 'number' || capacidadeCarga <= 0) {
            // Lança erro para o chamador (função de criação) tratar
            throw new Error("Capacidade de carga inválida para Caminhão (deve ser número positivo).");
        }
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.velocidadeMaxima = 120;
        this.tipo = "caminhao";
    }

    carregar(quantidade) {
        if (this.ligado) {
            throw new Error("Desligue o caminhão antes de carregar.");
        }
        if (typeof quantidade !== 'number' || quantidade <= 0) {
            throw new Error("A quantidade a carregar deve ser um número positivo.");
        }
        if (this.cargaAtual + quantidade > this.capacidadeCarga) {
            throw new Error(`Carga (${quantidade}kg) excede a capacidade restante (${this.capacidadeCarga - this.cargaAtual}kg).`);
        }
        this.cargaAtual += quantidade;
        const message = `Carregado ${quantidade}kg. Carga atual: ${this.cargaAtual}kg.`;
        console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
        // O chamador deve: mostrarStatusGlobal(message), atualizarStatusVisual, salvarGaragem
        return { success: true, message: message };
    }

    descarregar(quantidade) {
        if (this.ligado) {
            throw new Error("Desligue o caminhão antes de descarregar.");
        }
        if (typeof quantidade !== 'number' || quantidade <= 0) {
            throw new Error("A quantidade a descarregar deve ser um número positivo.");
        }
        if (this.cargaAtual - quantidade < 0) {
            throw new Error(`Não há carga suficiente para descarregar ${quantidade} kg. Carga atual: ${this.cargaAtual} kg.`);
        }
        this.cargaAtual -= quantidade;
        const message = `Descarregado ${quantidade}kg. Carga atual: ${this.cargaAtual}kg.`;
        console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
        // O chamador deve: mostrarStatusGlobal(message), atualizarStatusVisual, salvarGaragem
        return { success: true, message: message };
    }

    // Sobrescreve acelerar para considerar a carga
    acelerar(incremento) {
        if (!this.ligado) {
            throw new Error("Ligue o caminhão para acelerar.");
        }
        // Fator de redução: 1 (vazio) a ~0.5 (cheio)
        const fatorCarga = this.capacidadeCarga > 0 ? 1 - (this.cargaAtual / (this.capacidadeCarga * 2)) : 1;
        // Garante uma aceleração mínima (ex: 30% da normal)
        const incrementoReal = (incremento || 10) * Math.max(0.3, fatorCarga);
        // Chama o acelerar da classe pai
        return super.acelerar(incrementoReal); // Retorna a nova velocidade
         // O chamador cuida de playSound, atualizarStatusVisual
    }

    // Sobrescreve para adicionar info da carga
    exibirInformacoesDetalhes() {
        const infoBase = this.exibirInformacoesBase(); // Chama o método da classe pai
        return `
            ${infoBase}<br>
            Capacidade: ${this.capacidadeCarga} kg<br>
            Carga atual: ${this.cargaAtual} kg
        `;
    }

    // Método para recriar do localStorage
    static fromData(data) {
        try {
            // Valida capacidade ao recriar também
            const capacidade = data.capacidadeCarga ?? 0;
             if (typeof capacidade !== 'number' || capacidade <= 0) {
                console.warn(`Recriando caminhão ${data.modelo} com capacidade padrão 1000kg devido a valor inválido:`, data.capacidadeCarga);
                 // Define um padrão ou lança erro, dependendo da preferência.
                 // Lançar erro pode impedir o carregamento da garagem. Usar um padrão é mais robusto.
                 // throw new Error("Capacidade de carga inválida ao recriar Caminhão.");
                 data.capacidadeCarga = 1000; // Exemplo de valor padrão
             }
            const caminhao = new Caminhao(data.modelo, data.cor, data.capacidadeCarga, data.id || uuidv4());
            caminhao.ligado = data.ligado ?? false;
            caminhao.velocidade = data.velocidade ?? 0;
            caminhao.cargaAtual = data.cargaAtual ?? 0;

             // Valida carga atual vs capacidade
             if(caminhao.cargaAtual > caminhao.capacidadeCarga) {
                 console.warn(`Corrigindo carga atual (${caminhao.cargaAtual}kg) para capacidade máxima (${caminhao.capacidadeCarga}kg) do caminhão ${caminhao.modelo}.`);
                 caminhao.cargaAtual = caminhao.capacidadeCarga;
             }

            // Recriar objetos Manutencao
            if (Array.isArray(data.historicoManutencao)) {
                caminhao.historicoManutencao = data.historicoManutencao
                    .map(m => new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status))
                    .filter(m => m instanceof Manutencao);
                 // Reordenar
                 caminhao.historicoManutencao.sort((a, b) => {
                     const dataA = a.getDataObj();
                     const dataB = b.getDataObj();
                     if (!dataA) return 1;
                     if (!dataB) return -1;
                     return dataB.getTime() - dataA.getTime();
                 });
            } else {
                caminhao.historicoManutencao = [];
            }
            return caminhao;
        } catch (error) {
            console.error("Erro ao recriar Caminhao a partir dos dados:", data, error);
            return null;
        }
    }
}