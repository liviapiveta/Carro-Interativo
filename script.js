/**
 * script.js - Lógica da Aplicação Garagem Inteligente
 * Gerencia veículos, interações, manutenção e interface do usuário.
 */

// ===== CLASSES =====

/**
 * Representa um registro de manutenção (realizada ou agendada).
 */
class Manutencao {
    /**
     * @param {string} data - Data no formato YYYY-MM-DD.
     * @param {string} tipo - Tipo de serviço.
     * @param {number|null} custo - Custo do serviço (obrigatório se status='Realizada').
     * @param {string} [descricao=""] - Descrição opcional.
     * @param {'Realizada'|'Agendada'} [status="Realizada"] - Status da manutenção.
     */
    constructor(data, tipo, custo, descricao = "", status = "Realizada") {
        this.data = data;
        this.tipo = tipo.trim();
        // Armazena custo como número ou null
        this.custo = (custo !== null && custo !== undefined && !isNaN(parseFloat(custo))) ? parseFloat(custo) : null;
        this.descricao = descricao.trim();
        this.status = status; // 'Realizada' ou 'Agendada'
    }

    /**
     * Formata a manutenção para exibição.
     * @returns {string} Representação textual da manutenção.
     */
    formatar() {
        const dataFormatada = this.data ? new Date(this.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data inválida';
        let custoFormatado = "";
        // Exibe custo apenas se for 'Realizada' e tiver valor válido
        if (this.status === 'Realizada' && this.custo !== null && this.custo >= 0) {
            custoFormatado = ` - R$${Number(this.custo).toFixed(2)}`;
        }
        let descInfo = this.descricao ? ` (${this.descricao})` : '';
        let statusIcon = this.status === 'Realizada' ? '🔧' : '📅';
        return `${statusIcon} ${this.tipo} em ${dataFormatada}${custoFormatado}${descInfo} [${this.status}]`;
    }

    /**
     * Valida os dados da manutenção. Exibe alertas em caso de erro.
     * @returns {boolean} True se válido, False caso contrário.
     */
    validar() {
        const hoje = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        if (!this.tipo) {
            mostrarStatusGlobal("Erro: O tipo de serviço não pode estar vazio.", "error");
            return false;
        }
        if (!this.data) {
            mostrarStatusGlobal("Erro: A data da manutenção é obrigatória.", "error");
            return false;
        }
        // Validação básica da data
        try {
            const dataObj = new Date(this.data + 'T00:00:00');
            if (isNaN(dataObj.getTime())) throw new Error("Data inválida");

            // Validação específica de status vs data
            if (this.status === 'Realizada' && this.data > hoje) {
                mostrarStatusGlobal("Erro: Manutenção 'Realizada' não pode ter data futura.", "error");
                return false;
            }
            // Aviso opcional para agendamentos no passado (pode ser útil mantê-los)
            // if(this.status === 'Agendada' && this.data < hoje) {
            //     console.warn(`Aviso: Agendamento de '${this.tipo}' para ${this.data} está no passado.`);
            // }

        } catch (e) {
            mostrarStatusGlobal("Erro: Formato de data inválido. Use AAAA-MM-DD.", "error");
            return false;
        }

        // Custo é obrigatório e deve ser >= 0 para 'Realizada'
        if (this.status === 'Realizada' && (this.custo === null || this.custo < 0)) {
            mostrarStatusGlobal("Erro: Custo inválido para manutenção realizada. Deve ser um número positivo ou zero.", "error");
            return false;
        }
        // Valida status conhecido
        if (!['Realizada', 'Agendada'].includes(this.status)) {
            mostrarStatusGlobal("Erro: Status de manutenção inválido.", "error");
            return false;
        }

        return true; // Passou em todas as validações
    }

    /**
     * Retorna o objeto Date da manutenção para comparações.
     * @returns {Date|null} O objeto Date ou null se a data for inválida.
     */
    getDataObj() {
        try {
            // Adiciona T00:00:00 para evitar problemas de fuso horário ao criar só com data
            const dataObj = new Date(this.data + 'T00:00:00');
            if (isNaN(dataObj.getTime())) return null;
            return dataObj;
        } catch (e) {
            return null;
        }
    }
}

/**
 * Classe base para todos os veículos.
 */
class Carro {
    /**
     * @param {string} modelo - Modelo do carro.
     * @param {string} cor - Cor do carro.
     * @param {string} [id=uuid()] - ID único do veículo.
     */
    constructor(modelo, cor, id = uuidv4()) { // Usa UUID para IDs mais robustos
        if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios.");
        this.id = id;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = 180;
        this.tipo = "carro"; // Identificador do tipo
        this.historicoManutencao = []; // Array de objetos Manutencao
    }

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * @param {Manutencao} manutencao - O objeto Manutencao a ser adicionado.
     * @returns {boolean} True se adicionado com sucesso, False caso contrário.
     */
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
             console.error("Tentativa de adicionar objeto que não é Manutencao.");
             mostrarStatusGlobal("Erro interno ao adicionar manutenção.", "error");
             return false;
         }
        // A validação agora é feita antes de chamar este método, mas uma verificação extra não faz mal.
        if (!manutencao.validar()) {
             // A função validar() já deve ter mostrado o erro específico.
             return false;
        }

        try {
            this.historicoManutencao.push(manutencao);
            // Ordena sempre por data após adicionar (mais recentes primeiro é comum)
            this.historicoManutencao.sort((a, b) => {
                 const dataA = a.getDataObj();
                 const dataB = b.getDataObj();
                 if (!dataA) return 1;
                 if (!dataB) return -1;
                 // Ordena por data descendente (mais recente primeiro)
                 return dataB - dataA;
            });
            console.log(`Manutenção (${manutencao.status}) adicionada ao ${this.modelo}: ${manutencao.tipo}`);
            salvarGaragem(); // Salva o estado da garagem
            return true;
        } catch (error) {
             console.error("Erro ao adicionar ou ordenar manutenção:", error);
             mostrarStatusGlobal("Erro ao salvar manutenção.", "error");
             return false;
        }
    }

    /**
     * Retorna o histórico de manutenção formatado e separado por status.
     * @returns {{realizadas: string[], futuras: string[], passadas: string[]}} Objeto com listas de manutenções formatadas.
     */
    getHistoricoFormatado() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera horas para comparar só a data

        const realizadas = [];
        const futuras = [];
        const passadasAgendadas = []; // Agendamentos cuja data já passou

        this.historicoManutencao.forEach(m => {
            const dataManutencao = m.getDataObj();
            const textoFormatado = m.formatar();

            if (m.status === 'Realizada') {
                realizadas.push(textoFormatado);
            } else if (m.status === 'Agendada') {
                if (dataManutencao && dataManutencao >= hoje) {
                    futuras.push(textoFormatado);
                } else {
                    // Se a data for inválida ou anterior a hoje
                    passadasAgendadas.push(textoFormatado);
                }
            }
        });

        // Ordena agendamentos futuros por data (mais próxima primeiro)
        futuras.sort((a, b) => {
            // Extrai a data da string formatada para ordenar (simplificado, ideal seria usar o objeto)
            const dataStrA = a.match(/em (.*?)( - | \(| \[)/)?.[1];
            const dataStrB = b.match(/em (.*?)( - | \(| \[)/)?.[1];
            const dataA = dataStrA ? parsePtBrDate(dataStrA) : null;
            const dataB = dataStrB ? parsePtBrDate(dataStrB) : null;
            if (!dataA) return 1;
            if (!dataB) return -1;
            return dataA - dataB;
        });


        return { realizadas, futuras, passadas: passadasAgendadas };
    }

    ligar() {
        if (this.ligado) {
            mostrarStatusGlobal("O carro já está ligado!", "error");
            return;
        }
        this.ligado = true;
        playSound("somLigar");
        atualizarStatusVisual(this); // Atualiza a UI se este for o selecionado
        salvarGaragem();
        console.log(`${this.modelo} ligado!`);
        mostrarStatusGlobal(`${this.modelo} ligado.`, "success");
    }

    desligar() {
        if (!this.ligado) {
            mostrarStatusGlobal("O carro já está desligado!", "error");
            return;
        }
        if (this.velocidade > 0) {
            mostrarStatusGlobal("Pare o carro completamente antes de desligar!", "error");
            return;
        }
        this.ligado = false;
        // Velocidade já é 0, mas garantir
        this.velocidade = 0;
        playSound("somDesligar");
        atualizarStatusVisual(this);
        salvarGaragem();
        console.log(`${this.modelo} desligado!`);
         mostrarStatusGlobal(`${this.modelo} desligado.`, "success");
    }

    acelerar(incremento) {
        if (!this.ligado) {
            mostrarStatusGlobal("Ligue o carro para acelerar.", "error");
            return;
        }
        if (typeof incremento !== 'number' || incremento <= 0) {
             console.warn("Incremento de aceleração inválido:", incremento);
             incremento = 10; // Valor padrão
         }
        const novaVelocidade = this.velocidade + incremento;
        this.velocidade = Math.min(novaVelocidade, this.velocidadeMaxima); // Limita pela máxima

        playSound("somAcelerar");
        atualizarStatusVisual(this);
        // Não salvar a cada acelerada/freada para performance, mas pode ser necessário
        // salvarGaragem();
        console.log(`Velocidade de ${this.modelo}: ${this.velocidade} km/h`);
         // Mostrar status só se atingir max? Ou sempre? Optando por não mostrar para não poluir.
    }

    frear(decremento) {
        if (this.velocidade === 0) {
            // Não mostrar erro se já estiver parado
             return;
         }
         if (typeof decremento !== 'number' || decremento <= 0) {
              console.warn("Decremento de frenagem inválido:", decremento);
              decremento = 10; // Valor padrão
          }

        this.velocidade = Math.max(0, this.velocidade - decremento); // Garante mínimo 0
        playSound("somFrear");
        atualizarStatusVisual(this);

        console.log(`Velocidade de ${this.modelo}: ${this.velocidade} km/h`);
        // Salvar estado quando o carro parar completamente
        if (this.velocidade === 0) {
            salvarGaragem();
             mostrarStatusGlobal(`${this.modelo} parado.`, "success");
        }
    }

    buzinar() {
        playSound("somBuzina");
        console.log(`${this.modelo} buzinou: Beep beep!`);
        mostrarStatusGlobal(`${this.modelo} buzinou!`, "success");
    }

    /**
     * Retorna uma string HTML com as informações básicas do veículo.
     * @returns {string} HTML com as informações.
     */
    exibirInformacoesBase() {
        // Status visual é tratado separadamente pelo atualizarStatusVisual
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
            const carro = new Carro(data.modelo, data.cor, data.id);
            carro.ligado = data.ligado ?? false;
            carro.velocidade = data.velocidade ?? 0;
            carro.velocidadeMaxima = data.velocidadeMaxima ?? 180;
            // Recriar objetos Manutencao
            if (Array.isArray(data.historicoManutencao)) {
                carro.historicoManutencao = data.historicoManutencao.map(m =>
                    new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
                );
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

/**
 * Representa um Carro Esportivo, herdando de Carro.
 */
class CarroEsportivo extends Carro {
    constructor(modelo, cor, id = uuidv4()) {
        super(modelo, cor, id);
        this.turboAtivado = false;
        this.velocidadeMaxima = 250; // Vel max padrão esportivo
        this.velocidadeMaximaTurbo = 320; // Vel max com turbo
        this.tipo = "esportivo";
    }

    ativarTurbo() {
        if (!this.ligado) {
            mostrarStatusGlobal("Ligue o carro para ativar o turbo.", "error");
            return;
        }
        if (this.turboAtivado) {
            mostrarStatusGlobal("O turbo já está ativado!", "error");
            return;
        }
        this.turboAtivado = true;
        this.velocidadeMaxima = this.velocidadeMaximaTurbo;
        console.log("Turbo ativado!");
        mostrarStatusGlobal("Turbo Ativado!", "success");
        atualizarStatusVisual(this); // Atualiza UI (incluindo info e botões)
        salvarGaragem();
    }

    desativarTurbo() {
        if (!this.turboAtivado) {
            mostrarStatusGlobal("O turbo já está desativado.", "error");
            return;
        }
        this.turboAtivado = false;
        // Volta para a velocidade máxima padrão do esportivo
        const velMaxPadrao = Object.getPrototypeOf(this).constructor.prototype.velocidadeMaxima;
        this.velocidadeMaxima = velMaxPadrao;

        // Limita a velocidade atual se exceder a nova máxima
        if (this.velocidade > this.velocidadeMaxima) {
            this.velocidade = this.velocidadeMaxima;
            console.log("Velocidade limitada após desativar turbo.");
            mostrarStatusGlobal("Turbo Desativado. Velocidade limitada.", "success");
        } else {
             mostrarStatusGlobal("Turbo Desativado.", "success");
        }

        console.log("Turbo desativado!");
        atualizarStatusVisual(this);
        salvarGaragem();
    }

    // Sobrescreve acelerar para incluir boost do turbo
    acelerar(incremento) {
        if (!this.ligado) {
            mostrarStatusGlobal("Ligue o carro para acelerar.", "error");
            return;
        }
        const boost = this.turboAtivado ? 1.8 : 1.0; // Aceleração maior com turbo
        const incrementoReal = (incremento || 10) * boost;
        super.acelerar(incrementoReal); // Chama o acelerar da classe pai com boost
    }

    // Sobrescreve para adicionar info do turbo
    exibirInformacoesDetalhes() {
        const infoBase = this.exibirInformacoesBase();
        const turboStatus = this.turboAtivado ? '<span style="color: red; font-weight: bold;">Ativado</span>' : "Desativado";
        return `
            ${infoBase}<br>
            Turbo: ${turboStatus}
        `;
    }

    // Método para recriar do localStorage
    static fromData(data) {
         try {
            const esportivo = new CarroEsportivo(data.modelo, data.cor, data.id);
            // Preenche dados comuns usando o fromData da classe pai (se existir e for útil)
            // ou manualmente
            esportivo.ligado = data.ligado ?? false;
            esportivo.velocidade = data.velocidade ?? 0;
            esportivo.turboAtivado = data.turboAtivado ?? false;
            // Garante que a vel max correta seja definida com base no turbo
             esportivo.velocidadeMaxima = esportivo.turboAtivado ? esportivo.velocidadeMaximaTurbo : Object.getPrototypeOf(esportivo).constructor.prototype.velocidadeMaxima;

            // Recriar objetos Manutencao
            if (Array.isArray(data.historicoManutencao)) {
                esportivo.historicoManutencao = data.historicoManutencao.map(m =>
                    new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
                );
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

/**
 * Representa um Caminhão, herdando de Carro.
 */
class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga, id = uuidv4()) {
        super(modelo, cor, id);
        if (typeof capacidadeCarga !== 'number' || capacidadeCarga <= 0) {
            throw new Error("Capacidade de carga inválida para Caminhão.");
        }
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.velocidadeMaxima = 120; // Vel max padrão caminhão
        this.tipo = "caminhao";
    }

    carregar(quantidade) {
        if (this.ligado) {
            mostrarStatusGlobal("Desligue o caminhão antes de carregar/descarregar.", "error");
            return false; // Indica falha
        }
        if (typeof quantidade !== 'number' || quantidade <= 0) {
            mostrarStatusGlobal("A quantidade a carregar deve ser um número positivo.", "error");
            return false;
        }
        if (this.cargaAtual + quantidade > this.capacidadeCarga) {
            mostrarStatusGlobal(`Carga (${quantidade}kg) excede a capacidade restante (${this.capacidadeCarga - this.cargaAtual}kg).`, "error");
            return false;
        }
        this.cargaAtual += quantidade;
        console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
        mostrarStatusGlobal(`Carregado ${quantidade}kg. Carga atual: ${this.cargaAtual}kg.`, "success");
        atualizarStatusVisual(this);
        salvarGaragem();
        return true; // Indica sucesso
    }

    descarregar(quantidade) {
        if (this.ligado) {
            mostrarStatusGlobal("Desligue o caminhão antes de carregar/descarregar.", "error");
            return false;
        }
        if (typeof quantidade !== 'number' || quantidade <= 0) {
            mostrarStatusGlobal("A quantidade a descarregar deve ser um número positivo.", "error");
            return false;
        }
        if (this.cargaAtual - quantidade < 0) {
            mostrarStatusGlobal(`Não há carga suficiente para descarregar ${quantidade} kg. Carga atual: ${this.cargaAtual} kg.`, "error");
            return false;
        }
        this.cargaAtual -= quantidade;
        console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
        mostrarStatusGlobal(`Descarregado ${quantidade}kg. Carga atual: ${this.cargaAtual}kg.`, "success");
        atualizarStatusVisual(this);
        salvarGaragem();
        return true;
    }

    // Sobrescreve acelerar para considerar a carga
    acelerar(incremento) {
        if (!this.ligado) {
            mostrarStatusGlobal("Ligue o caminhão para acelerar.", "error");
            return;
        }
        // Fator de redução: 1 (vazio) a ~0.5 (cheio)
        const fatorCarga = 1 - (this.cargaAtual / (this.capacidadeCarga * 2));
        // Garante uma aceleração mínima (ex: 30% da normal)
        const incrementoReal = (incremento || 10) * Math.max(0.3, fatorCarga);
        super.acelerar(incrementoReal);
    }

    // Sobrescreve para adicionar info da carga
    exibirInformacoesDetalhes() {
        const infoBase = this.exibirInformacoesBase();
        return `
            ${infoBase}<br>
            Capacidade: ${this.capacidadeCarga} kg<br>
            Carga atual: ${this.cargaAtual} kg
        `;
    }

    // Método para recriar do localStorage
    static fromData(data) {
        try {
            const caminhao = new Caminhao(data.modelo, data.cor, data.capacidadeCarga, data.id);
            caminhao.ligado = data.ligado ?? false;
            caminhao.velocidade = data.velocidade ?? 0;
            caminhao.cargaAtual = data.cargaAtual ?? 0;
            // Recriar objetos Manutencao
            if (Array.isArray(data.historicoManutencao)) {
                caminhao.historicoManutencao = data.historicoManutencao.map(m =>
                    new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
                );
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


// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA =====

let garagem = []; // Array global para os veículos
let veiculoSelecionado = null; // Referência ao objeto do veículo atualmente selecionado

const GARAGEM_STORAGE_KEY = 'minhaGaragemInteligenteUnificada'; // Nova chave para evitar conflitos

/**
 * Salva o estado atual da garagem no LocalStorage.
 */
function salvarGaragem() {
    try {
        // Mapeia a garagem para um formato serializável (objetos planos)
        const garagemParaSalvar = garagem.map(veiculo => {
            // Cria uma cópia plana do objeto veículo
             const data = { ...veiculo };
             // Garante que o histórico de manutenção também seja salvo como objetos planos
             data.historicoManutencao = veiculo.historicoManutencao.map(m => ({...m}));
             return data;
        });
        localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(garagemParaSalvar));
        console.log(`Garagem salva com ${garagem.length} veículo(s).`);
    } catch (error) {
        console.error("Erro fatal ao salvar garagem no LocalStorage:", error);
        mostrarStatusGlobal("ERRO CRÍTICO: Não foi possível salvar a garagem!", "error");
        // Considerar desabilitar ações que modificam estado se salvar falhar?
    }
}

/**
 * Carrega a garagem do LocalStorage ao iniciar a aplicação.
 */
function carregarGaragem() {
    const dadosSalvos = localStorage.getItem(GARAGEM_STORAGE_KEY);
    if (!dadosSalvos) {
        console.log("Nenhuma garagem salva encontrada. Iniciando com garagem vazia.");
        garagem = [];
        atualizarListaVeiculosUI(); // Atualiza a UI para mostrar garagem vazia
        return;
    }

    try {
        const garagemData = JSON.parse(dadosSalvos);
        if (!Array.isArray(garagemData)) throw new Error("Dados salvos não são um array.");

        garagem = garagemData.map(data => {
            if (!data || !data.tipo) {
                 console.warn("Dado de veículo inválido ou sem tipo encontrado:", data);
                 return null; // Ignora dados inválidos
             }
            // Reconstrói os objetos com base no tipo
            switch (data.tipo) {
                case 'carro':       return Carro.fromData(data);
                case 'esportivo':   return CarroEsportivo.fromData(data);
                case 'caminhao':    return Caminhao.fromData(data);
                default:
                    console.warn("Tipo de veículo desconhecido encontrado nos dados salvos:", data.tipo);
                    return null; // Ignora tipos desconhecidos
            }
        }).filter(v => v instanceof Carro); // Filtra nulos e garante que são instâncias de Carro

        console.log(`Garagem carregada com ${garagem.length} veículo(s).`);
        atualizarListaVeiculosUI();
        verificarAgendamentosProximos(); // Verifica alertas ao carregar
        mostrarStatusGlobal(`Garagem carregada com ${garagem.length} veículo(s).`, "success");

    } catch (error) {
        console.error("Erro ao carregar/parsear garagem do LocalStorage:", error);
        mostrarStatusGlobal("Erro ao carregar dados salvos. Resetando garagem.", "error");
        garagem = []; // Reseta a garagem em caso de erro grave
        localStorage.removeItem(GARAGEM_STORAGE_KEY); // Limpa dados inválidos
        atualizarListaVeiculosUI();
    }
}


// ===== CONTROLE DA INTERFACE (UI) E NAVEGAÇÃO =====

const mainContent = document.getElementById('mainContent');
const viewGaragem = document.getElementById('viewGaragem');
const viewAdicionar = document.getElementById('viewAdicionar');
const viewDetalhesVeiculo = document.getElementById('viewDetalhesVeiculo');
const navGaragemLink = document.getElementById('navGaragem');
const navAdicionarLink = document.getElementById('navAdicionar');
const statusGlobalDiv = document.getElementById('statusGlobal');

/**
 * Mostra uma mensagem de status na área global (sidebar).
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success'|'error'|'info'} type - O tipo de mensagem (afeta o estilo).
 * @param {number} [duration=4000] - Duração em milissegundos (0 para permanente).
 */
function mostrarStatusGlobal(message, type = 'info', duration = 4000) {
    if (!statusGlobalDiv) return; // Sai se o elemento não existir

    statusGlobalDiv.textContent = message;
    statusGlobalDiv.className = `status-area ${type}`; // Aplica classe de estilo

    // Limpa a mensagem após a duração, exceto se for 0
    if (duration > 0) {
        setTimeout(() => {
             // Só limpa se a mensagem atual ainda for a mesma (evita apagar msgs novas)
             if (statusGlobalDiv.textContent === message) {
                  statusGlobalDiv.textContent = 'Pronto.';
                  statusGlobalDiv.className = 'status-area'; // Volta ao normal
             }
        }, duration);
    }
     // Rola a view da sidebar para o topo para garantir visibilidade do status
     const sidebar = document.querySelector('.sidebar');
     if (sidebar) sidebar.scrollTop = 0;
}

/**
 * Alterna a visibilidade das views principais no mainContent.
 * @param {'garagem'|'adicionar'|'detalhes'} viewToShow - A view a ser exibida.
 */
function switchView(viewToShow) {
    // Esconde todas as views
    viewGaragem.classList.add('hidden');
    viewAdicionar.classList.add('hidden');
    viewDetalhesVeiculo.classList.add('hidden');

    // Remove classe 'active' de todos os links de navegação
    navGaragemLink.classList.remove('active');
    navAdicionarLink.classList.remove('active');

    // Mostra a view selecionada e ativa o link correspondente
    switch (viewToShow) {
        case 'garagem':
            viewGaragem.classList.remove('hidden');
            navGaragemLink.classList.add('active');
            veiculoSelecionado = null; // Desseleciona ao voltar para a garagem
            atualizarListaVeiculosUI(); // Garante que a lista esteja atualizada
            mainContent.scrollTop = 0; // Rola para o topo
            break;
        case 'adicionar':
            viewAdicionar.classList.remove('hidden');
            navAdicionarLink.classList.add('active');
            document.getElementById('formAdicionarVeiculo').reset(); // Limpa o form
            document.getElementById('statusAdicionar').textContent = ''; // Limpa status do form
            toggleCamposCaminhao(); // Ajusta campos extras no form
             mainContent.scrollTop = 0;
            break;
        case 'detalhes':
            // Não ativa link de navegação, pois é um estado vindo da garagem
             if (veiculoSelecionado) { // Só mostra se houver um veículo selecionado
                 viewDetalhesVeiculo.classList.remove('hidden');
                 exibirInformacoesVeiculoSelecionado(); // Carrega os dados
                 mainContent.scrollTop = 0;
             } else {
                 // Se não houver veículo selecionado, volta para a garagem
                 console.warn("Tentativa de mostrar detalhes sem veículo selecionado. Voltando para garagem.");
                 switchView('garagem');
             }
            break;
        default:
            console.error("View desconhecida solicitada:", viewToShow);
            switchView('garagem'); // Volta para a garagem por segurança
    }
}

// ===== FUNÇÕES DE CRIAÇÃO E INTERFACE DE VEÍCULOS =====

/**
 * Atualiza a lista de veículos na UI (View Garagem).
 */
function atualizarListaVeiculosUI() {
    const listaDiv = document.getElementById("listaVeiculos");
    if (!listaDiv) return; // Sai se o elemento não existir

    listaDiv.innerHTML = ""; // Limpa a lista atual

    if (garagem.length === 0) {
        listaDiv.innerHTML = "<p>Sua garagem está vazia. Adicione um veículo!</p>";
        return;
    }

    // Ordena a garagem alfabeticamente pelo modelo para exibição
     const garagemOrdenada = [...garagem].sort((a, b) => a.modelo.localeCompare(b.modelo));

    garagemOrdenada.forEach(veiculo => {
        const itemVeiculo = document.createElement("div");
        itemVeiculo.classList.add("veiculo-item-lista");
        itemVeiculo.dataset.id = veiculo.id; // Armazena o ID no elemento
        itemVeiculo.dataset.tipo = veiculo.tipo; // Adiciona tipo para ícone CSS
        itemVeiculo.textContent = veiculo.getDescricaoLista(); // Texto: Modelo (Cor)
        itemVeiculo.setAttribute('role', 'button'); // Semântica
        itemVeiculo.setAttribute('tabindex', '0'); // Acessibilidade (foco com teclado)

        itemVeiculo.onclick = () => selecionarVeiculo(veiculo.id);
        itemVeiculo.onkeydown = (e) => { // Permite seleção com Enter/Espaço
             if (e.key === 'Enter' || e.key === ' ') {
                 selecionarVeiculo(veiculo.id);
             }
         };

        listaDiv.appendChild(itemVeiculo);
    });
}

/**
 * Seleciona um veículo pelo ID e muda para a view de detalhes.
 * @param {string} id - O ID do veículo a ser selecionado.
 */
function selecionarVeiculo(id) {
    const veiculoEncontrado = garagem.find(v => v.id === id);
    if (veiculoEncontrado) {
        veiculoSelecionado = veiculoEncontrado;
        console.log("Veículo selecionado:", veiculoSelecionado.modelo, veiculoSelecionado.id);
        switchView('detalhes'); // Muda para a view de detalhes
    } else {
        console.error("Veículo com ID não encontrado para seleção:", id);
        mostrarStatusGlobal("Erro: Veículo não encontrado.", "error");
        veiculoSelecionado = null;
        switchView('garagem'); // Volta para a lista se não encontrar
    }
}

/**
 * Exibe as informações do veículo selecionado na view de detalhes.
 */
function exibirInformacoesVeiculoSelecionado() {
    // Garante que estamos na view correta e temos um veículo
    if (!veiculoSelecionado || viewDetalhesVeiculo.classList.contains('hidden')) {
         console.warn("Tentativa de exibir detalhes sem veículo selecionado ou view oculta.");
         // Se estivermos na view de detalhes sem veículo, volta pra garagem
         if (!viewDetalhesVeiculo.classList.contains('hidden')) {
             switchView('garagem');
         }
         return;
     }

    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
    const imagemVeiculo = document.getElementById("imagemVeiculo");
    const historicoDiv = document.getElementById("historicoManutencao");
    const agendamentosDiv = document.getElementById("agendamentosFuturos");
    const formAgendamento = document.getElementById("formularioAgendamento");

    try {
        // Exibe informações usando o método polimórfico
        informacoesVeiculoDiv.innerHTML = veiculoSelecionado.exibirInformacoesDetalhes();

        // Define imagem baseada no tipo
        let imagePath = `imagens/${veiculoSelecionado.tipo}.png`; // Assume nomes de arquivo padrão
        imagemVeiculo.src = imagePath;
        imagemVeiculo.alt = `Imagem de um ${veiculoSelecionado.tipo} ${veiculoSelecionado.modelo}`;
        imagemVeiculo.style.display = "block";
         // Adiciona um fallback simples caso a imagem não carregue
         imagemVeiculo.onerror = () => {
             imagemVeiculo.style.display = 'none';
             console.warn(`Imagem não encontrada: ${imagePath}`);
         };

        // Atualiza status visual (velocidade, ligado/desligado)
        atualizarStatusVisual(veiculoSelecionado);

        // Atualiza displays de manutenção
        atualizarDisplayManutencao(veiculoSelecionado);

        // Controla visibilidade dos botões de ação específicos
        controlarBotoesAcaoVisibilidade();

        // Limpa o formulário de agendamento
        formAgendamento.reset();

    } catch (error) {
         console.error("Erro ao exibir informações do veículo selecionado:", error);
         mostrarStatusGlobal("Erro ao carregar detalhes do veículo.", "error");
         // Opcional: voltar para a garagem em caso de erro grave
         // switchView('garagem');
    }
}

/**
 * Atualiza a barra de progresso, texto de status (Ligado/Desligado)
 * e outras informações dinâmicas na view de detalhes.
 * @param {Carro} veiculo - O veículo cujas informações devem ser exibidas.
 */
function atualizarStatusVisual(veiculo) {
    // Só atualiza se o veículo passado for o selecionado e a view estiver visível
     if (!veiculoSelecionado || veiculo.id !== veiculoSelecionado.id || viewDetalhesVeiculo.classList.contains('hidden')) {
         return;
     }

    const velocidadeProgress = document.getElementById("velocidadeProgress");
    const statusVeiculoSpan = document.getElementById("statusVeiculo");
    const velocidadeTexto = document.getElementById("velocidadeTexto");
    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo"); // Para atualizar carga/turbo

    if (!velocidadeProgress || !statusVeiculoSpan || !velocidadeTexto || !informacoesVeiculoDiv) {
        console.error("Elementos da UI para status visual não encontrados.");
        return;
    }

    try {
        // --- Atualiza Barra de Velocidade ---
        const velMax = veiculo.velocidadeMaxima > 0 ? veiculo.velocidadeMaxima : 1; // Evita divisão por zero
        const porcentagemVelocidade = (veiculo.velocidade / velMax) * 100;
        // Garante que a porcentagem fique entre 0 e 100
        velocidadeProgress.style.width = `${Math.min(100, Math.max(0, porcentagemVelocidade))}%`;
        velocidadeTexto.textContent = `${Math.round(veiculo.velocidade)} km/h`;

        // --- Atualiza Status Ligado/Desligado ---
        if (veiculo.ligado) {
            statusVeiculoSpan.textContent = "Ligado";
            statusVeiculoSpan.className = "status-ligado";
        } else {
            statusVeiculoSpan.textContent = "Desligado";
            statusVeiculoSpan.className = "status-desligado";
        }

        // --- Re-renderiza as informações para refletir mudanças (carga, turbo) ---
        // Chama o método polimórfico para obter o HTML atualizado
        informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoesDetalhes();

        // --- Controla botões (habilita/desabilita baseado no estado) ---
        controlarBotoesAcaoEstado(veiculo);

    } catch (error) {
         console.error("Erro ao atualizar status visual:", error);
         // Não mostrar status global aqui para não poluir com erros internos frequentes
    }
}


/**
 * Controla a VISIBILIDADE dos botões de ação específicos (Turbo, Carga)
 * com base no TIPO do veículo selecionado. Chamado ao selecionar um veículo.
 */
function controlarBotoesAcaoVisibilidade() {
    if (!veiculoSelecionado) return;

    const ehEsportivo = veiculoSelecionado instanceof CarroEsportivo;
    const ehCaminhao = veiculoSelecionado instanceof Caminhao;

    // Esconde/mostra botões baseado no tipo
    document.getElementById('btnTurboOn').classList.toggle('hidden', !ehEsportivo);
    document.getElementById('btnTurboOff').classList.toggle('hidden', !ehEsportivo);
    document.getElementById('btnCarregar').classList.toggle('hidden', !ehCaminhao);
    document.getElementById('btnDescarregar').classList.toggle('hidden', !ehCaminhao);
}

/**
 * Controla o ESTADO (habilitado/desabilitado) dos botões de ação
 * com base no ESTADO ATUAL do veículo selecionado (ligado/desligado, turbo on/off, etc.).
 * Chamado sempre que o estado do veículo muda (ligar, desligar, acelerar, etc.).
 * @param {Carro} veiculo - O veículo selecionado.
 */
function controlarBotoesAcaoEstado(veiculo) {
     if (!veiculo) return;

     const ligado = veiculo.ligado;
     const parado = veiculo.velocidade === 0;

     // Botões gerais
     document.querySelector('button[onclick="interagir(\'ligar\')"]').disabled = ligado;
     document.querySelector('button[onclick="interagir(\'desligar\')"]').disabled = !ligado || !parado; // Só desliga parado
     document.querySelector('button[onclick="interagir(\'acelerar\')"]').disabled = !ligado;
     document.querySelector('button[onclick="interagir(\'frear\')"]').disabled = !ligado && parado; // Desabilitado se desligado E parado
     document.querySelector('button[onclick="interagir(\'buzinar\')"]').disabled = false; // Buzina sempre funciona? (Ou só ligado?) - Decisão: sempre

     // Botões específicos
     if (veiculo instanceof CarroEsportivo) {
         const turboAtivado = veiculo.turboAtivado;
         document.getElementById('btnTurboOn').disabled = !ligado || turboAtivado;
         document.getElementById('btnTurboOff').disabled = !ligado || !turboAtivado;
     }
     if (veiculo instanceof Caminhao) {
         const cargaAtual = veiculo.cargaAtual;
         const capacidade = veiculo.capacidadeCarga;
         // Só carrega/descarrega desligado
         document.getElementById('btnCarregar').disabled = ligado || cargaAtual >= capacidade;
         document.getElementById('btnDescarregar').disabled = ligado || cargaAtual <= 0;
     }
}


/**
 * Função unificada chamada pelo formulário de adição de veículo.
 * @param {Event} event - O evento de submit do formulário.
 */
function criarVeiculoUnificado(event) {
    event.preventDefault(); // Impede recarregamento da página
    const statusAdicionarP = document.getElementById('statusAdicionar');
    statusAdicionarP.textContent = ''; // Limpa status anterior

    const tipo = document.getElementById("addTipoVeiculo").value;
    const modelo = document.getElementById("addModelo").value.trim();
    const cor = document.getElementById("addCor").value.trim();

    let novoVeiculo = null;

    try {
        // Validações básicas comuns
        if (!modelo || !cor) {
             throw new Error("Modelo e Cor são obrigatórios.");
         }

        switch (tipo) {
            case 'carro':
                novoVeiculo = new Carro(modelo, cor);
                break;
            case 'esportivo':
                novoVeiculo = new CarroEsportivo(modelo, cor);
                break;
            case 'caminhao':
                const capacidadeInput = document.getElementById("addCapacidade");
                const capacidade = parseInt(capacidadeInput.value);
                // Validação específica de caminhão
                if (isNaN(capacidade) || capacidade <= 0) {
                     capacidadeInput.focus(); // Foca no campo inválido
                     throw new Error("Capacidade de carga inválida para Caminhão (deve ser número positivo).");
                 }
                novoVeiculo = new Caminhao(modelo, cor, capacidade);
                break;
            default:
                throw new Error("Tipo de veículo inválido selecionado.");
        }

        if (novoVeiculo) {
            garagem.push(novoVeiculo);
            salvarGaragem();
            atualizarListaVeiculosUI(); // Atualiza a lista na view da garagem
            console.log(`${novoVeiculo.tipo.charAt(0).toUpperCase() + novoVeiculo.tipo.slice(1)} ${novoVeiculo.modelo} criado.`);
            // Mensagem de sucesso no formulário e redireciona para a garagem
            statusAdicionarP.textContent = `${novoVeiculo.tipo.charAt(0).toUpperCase() + novoVeiculo.tipo.slice(1)} "${modelo}" adicionado com sucesso!`;
            statusAdicionarP.style.color = 'green';
            mostrarStatusGlobal(`${novoVeiculo.tipo} ${modelo} adicionado!`, 'success');
             // Limpa o form após sucesso
            event.target.reset(); // Reseta o formulário
            toggleCamposCaminhao(); // Garante que campos extras sejam resetados/ocultados

             // Opcional: Redirecionar para a garagem após um pequeno delay
             setTimeout(() => switchView('garagem'), 1500);

        }
    } catch (error) {
         console.error("Erro ao criar veículo:", error);
         // Exibe erro no formulário
         statusAdicionarP.textContent = `Erro: ${error.message}`;
         statusAdicionarP.style.color = 'red';
         mostrarStatusGlobal(`Falha ao adicionar veículo: ${error.message}`, 'error');
     }
}

/**
 * Mostra ou esconde os campos específicos para caminhão no formulário de adição.
 */
function toggleCamposCaminhao() {
    const tipoSelecionado = document.getElementById('addTipoVeiculo').value;
    const camposCaminhaoDiv = document.getElementById('camposCaminhao');
    const capacidadeInput = document.getElementById('addCapacidade');

    if (tipoSelecionado === 'caminhao') {
        camposCaminhaoDiv.classList.remove('hidden');
        capacidadeInput.required = true; // Torna obrigatório se for caminhão
    } else {
        camposCaminhaoDiv.classList.add('hidden');
        capacidadeInput.required = false; // Não obrigatório para outros tipos
        capacidadeInput.value = ''; // Limpa o valor se não for caminhão
    }
}


// ===== FUNÇÕES DE INTERAÇÃO COM O VEÍCULO SELECIONADO =====

/**
 * Função genérica chamada pelos botões de ação na view de detalhes.
 * @param {string} acao - A ação a ser executada (ex: 'ligar', 'acelerar').
 */
function interagir(acao) {
    if (!veiculoSelecionado) {
        mostrarStatusGlobal("Nenhum veículo selecionado para interagir!", "error");
        return;
    }

    console.log(`Tentando executar ação: ${acao} em ${veiculoSelecionado.modelo}`);

    try {
        switch (acao) {
            case "ligar":           veiculoSelecionado.ligar(); break;
            case "desligar":        veiculoSelecionado.desligar(); break;
            case "acelerar":        veiculoSelecionado.acelerar(15); break; // Incremento maior
            case "frear":           veiculoSelecionado.frear(20); break; // Decremento maior
            case "buzinar":         veiculoSelecionado.buzinar(); break;
            case "ativarTurbo":
                 if (veiculoSelecionado instanceof CarroEsportivo) veiculoSelecionado.ativarTurbo();
                 else mostrarStatusGlobal("Este veículo não possui turbo.", "error");
                 break;
            case "desativarTurbo":
                 if (veiculoSelecionado instanceof CarroEsportivo) veiculoSelecionado.desativarTurbo();
                 else mostrarStatusGlobal("Este veículo não possui turbo.", "error");
                 break;
            case "carregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                      // Verifica se está desligado ANTES de pedir o prompt
                      if (veiculoSelecionado.ligado) {
                           mostrarStatusGlobal("Desligue o caminhão antes de carregar.", "error");
                           return; // Sai sem pedir prompt
                       }
                       const cargaStr = prompt(`Quanto carregar? (Capacidade: ${veiculoSelecionado.capacidadeCarga}kg, Carga Atual: ${veiculoSelecionado.cargaAtual}kg, Restante: ${veiculoSelecionado.capacidadeCarga - veiculoSelecionado.cargaAtual}kg)`);
                       if (cargaStr !== null) { // Se usuário não cancelou
                            const carga = parseFloat(cargaStr);
                            if (!isNaN(carga) && carga > 0) {
                                veiculoSelecionado.carregar(carga); // O método carregar já mostra status
                            } else if (carga <= 0) {
                                mostrarStatusGlobal("A quantidade para carregar deve ser positiva.", "error");
                            } else {
                                mostrarStatusGlobal("Valor de carga inválido.", "error");
                            }
                        }
                 } else { mostrarStatusGlobal("Este veículo não pode ser carregado.", "error"); }
                 break;
            case "descarregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                      if (veiculoSelecionado.ligado) {
                           mostrarStatusGlobal("Desligue o caminhão antes de descarregar.", "error");
                           return;
                       }
                       const descargaStr = prompt(`Quanto descarregar? (Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                       if (descargaStr !== null) {
                           const descarga = parseFloat(descargaStr);
                           if (!isNaN(descarga) && descarga > 0) {
                               veiculoSelecionado.descarregar(descarga); // O método descarregar já mostra status
                           } else if (descarga <= 0) {
                                mostrarStatusGlobal("A quantidade para descarregar deve ser positiva.", "error");
                           } else {
                               mostrarStatusGlobal("Valor de descarga inválido.", "error");
                           }
                       }
                 } else { mostrarStatusGlobal("Este veículo não pode ser descarregado.", "error"); }
                 break;
            default:
                console.warn("Ação de interação desconhecida:", acao);
                 mostrarStatusGlobal(`Ação "${acao}" não reconhecida.`, "error");
        }

        // Após qualquer ação, atualiza a interface E o estado dos botões
         // A atualização visual já é chamada dentro dos métodos do veículo que modificam o estado
         // Mas podemos forçar aqui caso algum método não chame
         // if (veiculoSelecionado) { // Verifica se ainda está selecionado
         //     atualizarStatusVisual(veiculoSelecionado);
         // }

    } catch (error) {
        // Captura erros que possam ocorrer dentro dos métodos do veículo
        console.error(`Erro ao executar ação '${acao}' no veículo ${veiculoSelecionado.modelo}:`, error);
        mostrarStatusGlobal(`Erro inesperado durante a ação: ${error.message}`, "error");
    }
}


// ===== FUNÇÕES DE MANUTENÇÃO E AGENDAMENTO =====

/**
 * Atualiza a exibição do histórico e agendamentos na view de detalhes.
 * @param {Carro} veiculo - O veículo selecionado.
 */
function atualizarDisplayManutencao(veiculo) {
    const historicoDiv = document.getElementById("historicoManutencao");
    const agendamentosDiv = document.getElementById("agendamentosFuturos");

    // Limpa displays
    historicoDiv.innerHTML = "<p>Nenhuma manutenção realizada registrada.</p>";
    agendamentosDiv.innerHTML = "<p>Nenhum agendamento futuro.</p>";

    if (!veiculo) return; // Sai se não houver veículo

    try {
        const { realizadas, futuras, passadas } = veiculo.getHistoricoFormatado();

        // Exibe histórico de realizadas
        if (realizadas.length > 0) {
            historicoDiv.innerHTML = ""; // Limpa o placeholder
            realizadas.forEach(item => {
                const p = document.createElement("div"); // Usar div para melhor estilização
                p.classList.add("manutencao-item");
                p.textContent = item;
                historicoDiv.appendChild(p);
            });
        }

        // Exibe agendamentos futuros
        if (futuras.length > 0) {
            agendamentosDiv.innerHTML = ""; // Limpa o placeholder
            futuras.forEach(item => {
                const p = document.createElement("div");
                p.classList.add("agendamento-item");
                p.textContent = item;
                agendamentosDiv.appendChild(p);
            });
        }

        // Opcional: Exibir agendamentos passados que não foram marcados como realizados
        if (passadas.length > 0) {
            // Se já tinha futuros, adiciona um separador ou título
            if (futuras.length > 0) {
                 const separador = document.createElement('hr');
                 separador.style.marginTop = '15px';
                 agendamentosDiv.appendChild(separador);
            } else {
                // Se não tinha futuros, limpa o placeholder de agendamentos
                agendamentosDiv.innerHTML = "";
            }

             const passadasTitle = document.createElement('h4');
             passadasTitle.textContent = "Agendamentos Passados";
             passadasTitle.style.marginTop = '10px';
             passadasTitle.style.color = '#6c757d';
             agendamentosDiv.appendChild(passadasTitle);

             passadas.forEach(item => {
                 const p = document.createElement("div");
                 p.classList.add("agendamento-item", "passado"); // Adiciona classe 'passado'
                 p.textContent = item;
                 agendamentosDiv.appendChild(p);
             });
         }

    } catch (error) {
         console.error("Erro ao atualizar display de manutenção:", error);
         historicoDiv.innerHTML = "<p>Erro ao carregar histórico.</p>";
         agendamentosDiv.innerHTML = "<p>Erro ao carregar agendamentos.</p>";
         mostrarStatusGlobal("Erro ao exibir dados de manutenção.", "error");
    }
}


/**
 * Função chamada pelo formulário para AGENDAR uma nova manutenção.
 * @param {Event} event - O evento de submit do formulário.
 */
function agendarManutencao(event) {
    event.preventDefault(); // Impede envio padrão

    if (!veiculoSelecionado) {
        mostrarStatusGlobal("Selecione um veículo antes de agendar.", "error");
        return;
    }

    const data = document.getElementById("dataAgendamento").value;
    const tipo = document.getElementById("tipoAgendamento").value.trim();
    const custoInput = document.getElementById("custoAgendamento").value;
    const descricao = document.getElementById("descricaoAgendamento").value.trim();

    // Custo é opcional ao agendar, será tratado como null se vazio ou inválido
    const custo = (custoInput && !isNaN(parseFloat(custoInput)) && parseFloat(custoInput) >= 0)
                  ? parseFloat(custoInput)
                  : null;

    const novaManutencao = new Manutencao(data, tipo, custo, descricao, "Agendada");

    // Validação acontece dentro do adicionarManutencao (que chama validar())
    if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
        const dataFormatada = new Date(data+'T00:00:00').toLocaleDateString('pt-BR');
        mostrarStatusGlobal(`Manutenção "${tipo}" agendada para ${dataFormatada}!`, "success");
        atualizarDisplayManutencao(veiculoSelecionado); // Atualiza a UI
        document.getElementById("formularioAgendamento").reset(); // Limpa o formulário
        verificarAgendamentosProximos(); // Verifica alertas
    } else {
        // O erro específico já foi mostrado pela função validar() ou adicionarManutencao()
        console.error("Falha ao agendar manutenção (ver status global para detalhes).");
        // Focar no primeiro campo inválido pode ser útil aqui
    }
}

/**
 * Função chamada pelo botão para REGISTRAR uma manutenção já realizada.
 */
function adicionarManutencaoRealizada() {
     if (!veiculoSelecionado) {
         mostrarStatusGlobal("Selecione um veículo antes de registrar manutenção.", "error");
         return;
     }

     const dataInput = document.getElementById("dataAgendamento");
     const tipoInput = document.getElementById("tipoAgendamento");
     const custoInput = document.getElementById("custoAgendamento");
     const descricaoInput = document.getElementById("descricaoAgendamento");

     const data = dataInput.value;
     const tipo = tipoInput.value.trim();
     const custoStr = custoInput.value;
     const descricao = descricaoInput.value.trim();

     // Validação específica para 'Realizada': Custo é obrigatório e >= 0
     const custo = parseFloat(custoStr);
     if (custoStr === '' || isNaN(custo) || custo < 0) {
          mostrarStatusGlobal("Erro: O Custo é obrigatório e deve ser um número positivo (ou zero) para registrar manutenção realizada.", "error");
          custoInput.focus(); // Foca no campo de custo
          return;
      }

     const novaManutencao = new Manutencao(data, tipo, custo, descricao, "Realizada");

     // Validação acontece dentro do adicionarManutencao
     if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
         const dataFormatada = new Date(data+'T00:00:00').toLocaleDateString('pt-BR');
         mostrarStatusGlobal(`Manutenção "${tipo}" registrada como realizada em ${dataFormatada}!`, "success");
         atualizarDisplayManutencao(veiculoSelecionado); // Atualiza UI
         document.getElementById("formularioAgendamento").reset(); // Limpa form
     } else {
          console.error("Falha ao registrar manutenção realizada (ver status global).");
           // Focar no campo que pode ter causado o erro (data ou tipo se custo já foi validado)
           if (!data) dataInput.focus();
           else if (!tipo) tipoInput.focus();
     }
}

// ===== UTILITÁRIOS =====

/**
 * Gera um UUID v4 (identificador único universal).
 * @returns {string} Um UUID v4.
 */
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/**
 * Reproduz um som pelo ID do elemento de áudio.
 * @param {string} soundId - O ID do elemento <audio>.
 */
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound && sound instanceof HTMLAudioElement) {
        sound.currentTime = 0; // Reinicia para tocar do início
        sound.play().catch(error => {
            // Erros comuns: interação do usuário necessária, formato não suportado
             if (error.name === 'NotAllowedError') {
                 console.warn("Reprodução de áudio bloqueada pelo navegador. Interação do usuário necessária.");
                 // Poderia exibir uma mensagem sutil na UI pedindo para clicar em algo
             } else {
                 console.warn(`Erro ao tocar som "${soundId}":`, error);
             }
        });
    } else {
        console.warn("Elemento de áudio não encontrado ou inválido:", soundId);
    }
}

/**
 * Converte uma data string dd/mm/yyyy para um objeto Date.
 * @param {string} dateString - Data no formato "dd/mm/yyyy".
 * @returns {Date|null} Objeto Date ou null se inválido.
 */
function parsePtBrDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // Formato: Mês é 0-indexado no construtor Date
        const date = new Date(+parts[2], parts[1] - 1, +parts[0]);
        // Verifica se a data criada é válida e corresponde às partes
        if (date && date.getDate() == parts[0] && date.getMonth() == parts[1] - 1 && date.getFullYear() == parts[2]) {
            return date;
        }
    }
    return null;
}


/**
 * Verifica agendamentos próximos (hoje, amanhã) e exibe alertas.
 */
function verificarAgendamentosProximos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    let alertasHoje = [];
    let alertasAmanha = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.status === 'Agendada') {
                const dataAgendamento = manutencao.getDataObj();
                if (dataAgendamento) {
                    dataAgendamento.setHours(0,0,0,0); // Compara só a data

                    if (dataAgendamento.getTime() === hoje.getTime()) {
                        alertasHoje.push(`HOJE: ${manutencao.tipo} - ${veiculo.modelo}`);
                    } else if (dataAgendamento.getTime() === amanha.getTime()) {
                        alertasAmanha.push(`AMANHÃ: ${manutencao.tipo} - ${veiculo.modelo}`);
                    }
                }
            }
        });
    });

    const todosAlertas = [...alertasHoje, ...alertasAmanha];

    if (todosAlertas.length > 0) {
        // Exibe um único alerta com todas as notificações importantes
         // Usar mostrarStatusGlobal ou alert()? Alert é mais intrusivo.
         // Usando status global para ser menos disruptivo.
         mostrarStatusGlobal(`Lembretes: ${todosAlertas.join(' | ')}`, 'info', 10000); // Duração maior
         // alert("Lembretes de Agendamento:\n\n" + todosAlertas.join("\n"));
    }
}


// ===== INICIALIZAÇÃO E EVENT LISTENERS GLOBAIS =====

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM carregado. Iniciando Garagem Inteligente...");

    // Adiciona listeners para navegação principal
    navGaragemLink.addEventListener('click', (e) => { e.preventDefault(); switchView('garagem'); });
    navAdicionarLink.addEventListener('click', (e) => { e.preventDefault(); switchView('adicionar'); });

    // Adiciona listener para o botão "Voltar" na view de detalhes
    document.getElementById('btnVoltarGaragem').addEventListener('click', () => switchView('garagem'));

    // Adiciona listener para o select de tipo de veículo no form de adição
    document.getElementById('addTipoVeiculo').addEventListener('change', toggleCamposCaminhao);

    // Carrega a garagem salva
    carregarGaragem();

    // Define a view inicial
    switchView('garagem'); // Começa mostrando a lista de veículos

    // Verifica agendamentos logo após carregar
    // verificarAgendamentosProximos(); // Já é chamado dentro de carregarGaragem

    console.log("Garagem Inteligente inicializada.");
     mostrarStatusGlobal("Sistema pronto.", "success", 2000);
});

// Opcional: Salvar antes de fechar a página (pode não ser 100% confiável)
// window.addEventListener('beforeunload', (event) => {
//      console.log("Tentando salvar garagem antes de descarregar a página...");
//      salvarGaragem();
     // Não é recomendado impedir o fechamento aqui (delete event.returnValue)
// });