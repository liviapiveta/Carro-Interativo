/**
 * js/classes/Manutencao.js
 * Representa um registro de manutenção (realizada ou agendada).
 */

// Import necessary functions if they were used directly inside the class
// (In this case, validation logic relies on the caller showing status, so no direct UI imports needed here)

export class Manutencao {
    /**
     * @param {string} data - Data no formato YYYY-MM-DD.
     * @param {string} tipo - Tipo de serviço.
     * @param {number|null} custo - Custo do serviço (obrigatório se status='Realizada').
     * @param {string} [descricao=""] - Descrição opcional.
     * @param {'Realizada'|'Agendada'} [status="Realizada"] - Status da manutenção.
     */
    constructor(data, tipo, custo, descricao = "", status = "Realizada") {
        this.data = data;
        this.tipo = tipo ? tipo.trim() : "";
        this.custo = (custo !== null && custo !== undefined && !isNaN(parseFloat(custo))) ? parseFloat(custo) : null;
        this.descricao = descricao ? descricao.trim() : "";
        this.status = status; // 'Realizada' ou 'Agendada'
    }

    /**
     * Formata a manutenção para exibição.
     * @returns {string} Representação textual da manutenção.
     */
    formatar() {
        // Helper internal para formatar data de forma segura
        const formatarData = (dataStr) => {
             try {
                 // Adiciona T00:00:00 para evitar problemas de fuso horário ao criar só com data
                 const dataObj = new Date(dataStr + 'T00:00:00');
                 if (isNaN(dataObj.getTime())) return 'Data inválida';
                 return dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Especifica UTC para consistência
             } catch (e) {
                 return 'Data inválida';
             }
         };

        const dataFormatada = this.data ? formatarData(this.data) : 'Data inválida';
        let custoFormatado = "";
        if (this.status === 'Realizada' && this.custo !== null && this.custo >= 0) {
            custoFormatado = ` - R$${Number(this.custo).toFixed(2)}`;
        }
        let descInfo = this.descricao ? ` (${this.descricao})` : '';
        let statusIcon = this.status === 'Realizada' ? '🔧' : '📅';
        return `${statusIcon} ${this.tipo} em ${dataFormatada}${custoFormatado}${descInfo} [${this.status}]`;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {{isValid: boolean, message: string|null}} Objeto indicando validade e mensagem de erro.
     */
    validar() {
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0); // Usa UTC para comparar com a data YYYY-MM-DD
        const dataHojeStr = hoje.toISOString().split('T')[0];

        if (!this.tipo) {
            return { isValid: false, message: "Erro: O tipo de serviço não pode estar vazio." };
        }
        if (!this.data) {
            return { isValid: false, message: "Erro: A data da manutenção é obrigatória." };
        }

        try {
            const dataObj = this.getDataObj();
            if (!dataObj) throw new Error("Data inválida");

             // Normaliza o objeto Date para meia-noite UTC para comparação segura
             dataObj.setUTCHours(0, 0, 0, 0);

            // Validação específica de status vs data
            if (this.status === 'Realizada' && this.data > dataHojeStr) {
                return { isValid: false, message: "Erro: Manutenção 'Realizada' não pode ter data futura." };
            }
            // Aviso opcional (não invalida, mas pode ser logado pelo chamador)
            // if (this.status === 'Agendada' && this.data < dataHojeStr) {
            //     console.warn(`Aviso: Agendamento de '${this.tipo}' para ${this.data} está no passado.`);
            // }

        } catch (e) {
            return { isValid: false, message: "Erro: Formato de data inválido. Use AAAA-MM-DD." };
        }

        if (this.status === 'Realizada' && (this.custo === null || this.custo < 0)) {
            return { isValid: false, message: "Erro: Custo inválido para manutenção realizada. Deve ser um número positivo ou zero." };
        }
        if (!['Realizada', 'Agendada'].includes(this.status)) {
            return { isValid: false, message: "Erro: Status de manutenção inválido." };
        }

        return { isValid: true, message: null }; // Passou em todas as validações
    }

    /**
     * Retorna o objeto Date da manutenção para comparações (em UTC).
     * @returns {Date|null} O objeto Date (UTC) ou null se a data for inválida.
     */
    getDataObj() {
        try {
            // Cria a data como UTC para evitar problemas de fuso horário
            const dataObj = new Date(this.data + 'T00:00:00Z'); // Adiciona Z para indicar UTC
            if (isNaN(dataObj.getTime())) return null;
            return dataObj;
        } catch (e) {
            console.error("Erro ao criar objeto Date:", e);
            return null;
        }
    }
}