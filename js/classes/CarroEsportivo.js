/**
 * js/classes/CarroEsportivo.js
 * Representa um Carro Esportivo, herdando de Carro.
 */
import { Carro } from './Carro.js';
import { Manutencao } from './Manutencao.js'; // Necessário para fromData

export class CarroEsportivo extends Carro {
    constructor(modelo, cor, id) { // ID passado externamente
        super(modelo, cor, id);
        this.turboAtivado = false;
        this.velocidadeMaximaPadrao = 250; // Renomeado para clareza
        this.velocidadeMaximaTurbo = 320;
        this.velocidadeMaxima = this.velocidadeMaximaPadrao; // Inicializa com a padrão
        this.tipo = "esportivo";
    }

    ativarTurbo() {
        if (!this.ligado) {
            throw new Error("Ligue o carro para ativar o turbo.");
        }
        if (this.turboAtivado) {
            throw new Error("O turbo já está ativado!");
        }
        this.turboAtivado = true;
        this.velocidadeMaxima = this.velocidadeMaximaTurbo;
        console.log("Turbo ativado!");
        // O chamador deve: mostrarStatusGlobal, atualizarStatusVisual, salvarGaragem
        return true;
    }

    desativarTurbo() {
        if (!this.turboAtivado) {
            throw new Error("O turbo já está desativado.");
        }
        this.turboAtivado = false;
        this.velocidadeMaxima = this.velocidadeMaximaPadrao;

        let statusMessage = "Turbo Desativado.";
        // Limita a velocidade atual se exceder a nova máxima
        if (this.velocidade > this.velocidadeMaxima) {
            this.velocidade = this.velocidadeMaxima;
            console.log("Velocidade limitada após desativar turbo.");
            statusMessage = "Turbo Desativado. Velocidade limitada.";
        }
        console.log("Turbo desativado!");
         // O chamador deve: mostrarStatusGlobal(statusMessage), atualizarStatusVisual, salvarGaragem
        return { success: true, message: statusMessage };
    }

    // Sobrescreve acelerar para incluir boost do turbo
    acelerar(incremento) {
        if (!this.ligado) {
            throw new Error("Ligue o carro para acelerar.");
        }
        const boost = this.turboAtivado ? 1.8 : 1.0;
        const incrementoReal = (incremento || 10) * boost;
        // Chama o acelerar da classe pai com boost
        return super.acelerar(incrementoReal); // Retorna a nova velocidade
        // O chamador cuida de playSound, atualizarStatusVisual
    }

    // Sobrescreve para adicionar info do turbo
    exibirInformacoesDetalhes() {
        const infoBase = this.exibirInformacoesBase(); // Chama o método da classe pai
        const turboStatus = this.turboAtivado ? '<span style="color: red; font-weight: bold;">Ativado</span>' : "Desativado";
        // Atualiza a velocidade máxima exibida dinamicamente
        const velMaxExibida = this.velocidadeMaxima;
         // Recria a base com a vel max atualizada e adiciona turbo
         return `
             ID: ${this.id}<br>
             Modelo: ${this.modelo}<br>
             Cor: ${this.cor}<br>
             Tipo: ${this.tipo.charAt(0).toUpperCase() + this.tipo.slice(1)}<br>
             Velocidade Máxima: ${velMaxExibida} km/h<br>
             Turbo: ${turboStatus}
         `;
    }

    // Método para recriar do localStorage
    static fromData(data) {
        try {
            const esportivo = new CarroEsportivo(data.modelo, data.cor, data.id || uuidv4());
            esportivo.ligado = data.ligado ?? false;
            esportivo.velocidade = data.velocidade ?? 0;
            esportivo.turboAtivado = data.turboAtivado ?? false;
            // Garante que a vel max correta seja definida com base no turbo
            esportivo.velocidadeMaxima = esportivo.turboAtivado
                ? esportivo.velocidadeMaximaTurbo
                : esportivo.velocidadeMaximaPadrao;

            // Recriar objetos Manutencao
            if (Array.isArray(data.historicoManutencao)) {
                esportivo.historicoManutencao = data.historicoManutencao
                    .map(m => new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status))
                    .filter(m => m instanceof Manutencao);
                 // Reordenar
                 esportivo.historicoManutencao.sort((a, b) => {
                     const dataA = a.getDataObj();
                     const dataB = b.getDataObj();
                     if (!dataA) return 1;
                     if (!dataB) return -1;
                     return dataB.getTime() - dataA.getTime();
                 });
            } else {
                esportivo.historicoManutencao = [];
            }
            return esportivo;
        } catch (error) {
            console.error("Erro ao recriar CarroEsportivo a partir dos dados:", data, error);
            return null;
        }
    }
}