// ===== NOVA CLASSE Manutencao =====
class Manutencao {
    constructor(data, tipo, custo, descricao = "", status = "Realizada") { // status: 'Realizada' ou 'Agendada'
        this.data = data; // Espera-se uma string YYYY-MM-DD
        this.tipo = tipo;
        this.custo = custo;
        this.descricao = descricao;
        this.status = status;
    }

    // Retorna uma representação formatada da manutenção
    formatar() {
        const dataFormatada = this.data ? new Date(this.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não definida';
        let custoFormatado = "";
        if (this.custo !== null && this.custo !== undefined && this.status === 'Realizada') {
             custoFormatado = ` - R$${Number(this.custo).toFixed(2)}`;
        }
        let descInfo = this.descricao ? ` (${this.descricao})` : '';
        return `${this.tipo} em ${dataFormatada}${custoFormatado}${descInfo} [${this.status}]`;
    }

    // Valida os dados da manutenção
    validar() {
        const hoje = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        if (!this.tipo || this.tipo.trim() === "") {
            alert("Erro: O tipo de serviço não pode estar vazio.");
            return false;
        }
        if (!this.data) {
             alert("Erro: A data da manutenção é obrigatória.");
             return false;
         }
        // Tenta criar um objeto Date para validação básica
        try {
            const dataObj = new Date(this.data + 'T00:00:00');
            if (isNaN(dataObj.getTime())) {
                throw new Error("Data inválida");
            }
            // Validação específica para status
            if(this.status === 'Realizada' && this.data > hoje) {
                alert("Erro: Manutenção 'Realizada' não pode ter data futura.");
                return false;
            }
            // if(this.status === 'Agendada' && this.data < hoje) {
            //     alert("Aviso: Agendamento com data no passado."); // Poderia ser um aviso ou erro
            // }

        } catch (e) {
            alert("Erro: Formato de data inválido. Use AAAA-MM-DD.");
            return false;
        }

        if (this.status === 'Realizada' && (this.custo === null || this.custo === undefined || isNaN(Number(this.custo)) || Number(this.custo) < 0)) {
            alert("Erro: Custo inválido para manutenção realizada. Deve ser um número positivo ou zero.");
            return false;
        }
         if (!['Realizada', 'Agendada'].includes(this.status)) {
            alert("Erro: Status de manutenção inválido.");
            return false;
         }

        return true;
    }

    // Para facilitar a comparação de datas
    getDataObj() {
        try {
            return new Date(this.data + 'T00:00:00');
        } catch (e) {
            return null; // Retorna null se a data for inválida
        }
    }
}


// ===== MODIFICAÇÕES NAS CLASSES DE VEÍCULO =====

class Carro {
    constructor(modelo, cor, id = Date.now() + Math.random()) { // Adiciona ID único
        this.id = id; // ID para identificar no localStorage e seleção
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = 180;
        this.tipo = "carro";
        this.historicoManutencao = []; // Array para objetos Manutencao
    }

    // Método para adicionar manutenção
    adicionarManutencao(manutencao) {
        if (manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencao.push(manutencao);
            this.historicoManutencao.sort((a, b) => { // Ordena por data
                 const dataA = a.getDataObj();
                 const dataB = b.getDataObj();
                 if (!dataA) return 1; // Datas inválidas vão para o fim
                 if (!dataB) return -1;
                 return dataA - dataB;
            });
            console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencao.tipo}`);
            salvarGaragem(); // Salva após adicionar
            return true;
        }
        console.error("Falha ao adicionar manutenção: objeto inválido.");
        return false;
    }

    // Retorna o histórico formatado (separado por status)
    getHistoricoFormatado() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar só a data

        const realizadas = this.historicoManutencao
            .filter(m => m.status === 'Realizada')
            .map(m => m.formatar());

        const agendadas = this.historicoManutencao
            .filter(m => m.status === 'Agendada')
            .map(m => ({ // Retorna objeto para verificar data
                texto: m.formatar(),
                dataObj: m.getDataObj()
             }));

        const futuras = agendadas
             .filter(a => a.dataObj && a.dataObj >= hoje)
             .map(a => a.texto);

        const passadasAgendadas = agendadas
            .filter(a => !a.dataObj || a.dataObj < hoje)
            .map(a => a.texto); // Agendamentos que já passaram


        return {
            realizadas: realizadas,
            futuras: futuras,
            passadas: passadasAgendadas // Agendamentos passados podem ser mostrados separados
        };
    }

    ligar() {
        if (this.ligado) {
            alert("O carro já está ligado!");
            return;
        }
        this.ligado = true;
        playSound("somLigar");
        atualizarStatusVisual(this);
        salvarGaragem(); // Salva estado
        console.log("Carro ligado!");
    }

    desligar() {
        if (!this.ligado) {
            alert("O carro já está desligado!");
            return;
        }
        // Não permitir desligar em movimento (opcional, mas realista)
        if (this.velocidade > 0) {
             alert("Pare o carro antes de desligar!");
             return;
         }
        this.ligado = false;
        this.velocidade = 0;
        playSound("somDesligar");
        atualizarStatusVisual(this);
        salvarGaragem(); // Salva estado
        console.log("Carro desligado!");
    }

    acelerar(incremento) {
        if (!this.ligado) {
            alert("O carro precisa estar ligado para acelerar.");
            return;
        }
        const novaVelocidade = this.velocidade + incremento;
        if (novaVelocidade >= this.velocidadeMaxima) {
            this.velocidade = this.velocidadeMaxima;
            // alert("Velocidade máxima atingida!"); // Pode ser irritante
        } else {
            this.velocidade = novaVelocidade;
        }
        playSound("somAcelerar");
        atualizarStatusVisual(this);
        // Não salva a cada acelerada para não sobrecarregar localStorage
        console.log(`Velocidade aumentada para ${this.velocidade}`);
    }

    frear(decremento) {
        if (this.velocidade === 0 && this.ligado) { // So alerta se estiver ligado
            // alert("O carro já está parado."); // Pode ser irritante
             return;
         }
         if (!this.ligado && this.velocidade === 0) return; // Se desligado e parado, não faz nada

        this.velocidade = Math.max(0, this.velocidade - decremento); // Garante que a velocidade não seja negativa
        playSound("somFrear");
        atualizarStatusVisual(this);
        // Não salva a cada freada
        console.log(`Velocidade reduzida para ${this.velocidade}`);
         // Se parou completamente, salvar o estado
         if (this.velocidade === 0) {
             salvarGaragem();
         }
    }


    buzinar() {
        playSound("somBuzina");
        console.log("Beep beep!");
    }

    exibirInformacoes() {
        // A exibição do histórico foi movida para uma área separada
        const status = this.ligado ? `<span class="status-ligado">Ligado</span>` : `<span class="status-desligado">Desligado</span>`;
        return `
            ID: ${this.id}<br>
            Modelo: ${this.modelo}<br>
            Cor: ${this.cor}<br>
            Status: ${status}<br>
            Velocidade: ${this.velocidade} km/h<br>
            Velocidade Máxima: ${this.velocidadeMaxima} km/h`;
    }

    // Usado para a lista de veículos na garagem
    getDescricaoLista() {
         return `${this.tipo.charAt(0).toUpperCase() + this.tipo.slice(1)}: ${this.modelo} (${this.cor})`;
     }

    // Método necessário para recriar o objeto a partir de dados puros do localStorage
    static fromData(data) {
        const carro = new Carro(data.modelo, data.cor, data.id);
        carro.ligado = data.ligado;
        carro.velocidade = data.velocidade;
        // Recriar objetos Manutencao
        carro.historicoManutencao = data.historicoManutencao.map(m =>
            new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
        );
        return carro;
    }
}

class CarroEsportivo extends Carro {
    constructor(modelo, cor, id = Date.now() + Math.random()) {
        super(modelo, cor, id);
        this.turboAtivado = false;
        this.velocidadeMaxima = 250;
        this.tipo = "esportivo";
    }

    ativarTurbo() {
        if (!this.ligado) {
            alert("O carro precisa estar ligado para ativar o turbo.");
            return;
        }
        if (this.turboAtivado) {
            alert("O turbo já está ativado!");
            return;
        }
        this.turboAtivado = true;
        this.velocidadeMaxima = 320; // Aumenta a vel max com turbo
        // this.acelerar(50); // Dar um boost inicial pode ser opcional
        console.log("Turbo ativado!");
        atualizarStatusVisual(this);
        salvarGaragem(); // Salva estado
    }

    desativarTurbo() {
        if (!this.turboAtivado) {
            alert("O turbo já está desativado!");
            return;
        }
        this.turboAtivado = false;
        this.velocidadeMaxima = 250; // Retorna ao normal
        // Verifica se velocidade atual excede a nova máxima
        if (this.velocidade > this.velocidadeMaxima) {
             // Poderia frear automaticamente ou só limitar
             // this.frear(this.velocidade - this.velocidadeMaxima);
             console.log("Velocidade limitada após desativar turbo.");
         }
        console.log("Turbo desativado!");
        atualizarStatusVisual(this);
        salvarGaragem(); // Salva estado
    }

     acelerar(incremento) {
         const boost = this.turboAtivado ? 1.5 : 1; // Turbo aumenta a aceleração
         super.acelerar(incremento * boost);
     }


    exibirInformacoes() {
        const infoBase = super.exibirInformacoes();
        const turboStatus = this.turboAtivado ? "Ativado" : "Desativado";
        return `
            ${infoBase}<br>
            Turbo: ${turboStatus}
        `;
    }

    // Método para recriar do localStorage
    static fromData(data) {
        const esportivo = new CarroEsportivo(data.modelo, data.cor, data.id);
        esportivo.ligado = data.ligado;
        esportivo.velocidade = data.velocidade;
        esportivo.turboAtivado = data.turboAtivado;
         // Recriar objetos Manutencao
         esportivo.historicoManutencao = data.historicoManutencao.map(m =>
             new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
         );
        return esportivo;
    }
}

class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga, id = Date.now() + Math.random()) {
        super(modelo, cor, id);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.velocidadeMaxima = 120;
        this.tipo = "caminhao";
    }

    carregar(quantidade) {
         if (this.ligado) {
             alert("Desligue o caminhão antes de carregar/descarregar.");
             return;
         }
        if (isNaN(quantidade) || quantidade <= 0) {
            alert("A quantidade a carregar deve ser um número positivo.");
            return;
        }
        if (this.cargaAtual + quantidade > this.capacidadeCarga) {
            alert(`Carga excede a capacidade do caminhão (${this.capacidadeCarga} kg).`);
            return;
        }
        this.cargaAtual += quantidade;
        console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
        atualizarStatusVisual(this); // Atualiza info na tela se estiver selecionado
        salvarGaragem(); // Salva estado
    }

    descarregar(quantidade) {
         if (this.ligado) {
             alert("Desligue o caminhão antes de carregar/descarregar.");
             return;
         }
        if (isNaN(quantidade) || quantidade <= 0) {
            alert("A quantidade a descarregar deve ser um número positivo.");
            return;
        }
        if (this.cargaAtual - quantidade < 0) {
            alert(`Não há carga suficiente para descarregar ${quantidade} kg. Carga atual: ${this.cargaAtual} kg.`);
            return;
        }
        this.cargaAtual -= quantidade;
        console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
        atualizarStatusVisual(this); // Atualiza info na tela se estiver selecionado
        salvarGaragem(); // Salva estado
    }

     // Caminhão acelera mais devagar com carga (exemplo)
     acelerar(incremento) {
         const fatorCarga = 1 - (this.cargaAtual / (this.capacidadeCarga * 2)); // Ex: 50% carga = 75% aceleração normal
         super.acelerar(incremento * Math.max(0.3, fatorCarga)); // Garante uma aceleração mínima
     }

    exibirInformacoes() {
        const infoBase = super.exibirInformacoes();
        return `
            ${infoBase}<br>
            Capacidade: ${this.capacidadeCarga} kg<br>
            Carga atual: ${this.cargaAtual} kg`;
    }

    // Método para recriar do localStorage
    static fromData(data) {
        const caminhao = new Caminhao(data.modelo, data.cor, data.capacidadeCarga, data.id);
        caminhao.ligado = data.ligado;
        caminhao.velocidade = data.velocidade;
        caminhao.cargaAtual = data.cargaAtual;
        // Recriar objetos Manutencao
        caminhao.historicoManutencao = data.historicoManutencao.map(m =>
            new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
        );
        return caminhao;
    }
}


// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA =====

let garagem = []; // Array central para todos os veículos
let veiculoSelecionado = null; // Referência ao objeto veículo selecionado

const GARAGEM_STORAGE_KEY = 'minhaGaragem Inteligente';

// Função para salvar a garagem no LocalStorage
function salvarGaragem() {
    try {
        // Prepara os dados para salvar (sem métodos, apenas propriedades)
        const garagemParaSalvar = garagem.map(veiculo => {
             // Cria um objeto plano com todas as propriedades necessárias
             const data = { ...veiculo };
             // Converte o histórico de manutenção para objetos planos também
             data.historicoManutencao = veiculo.historicoManutencao.map(m => ({...m}));
             return data;
        });
        localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(garagemParaSalvar));
        console.log("Garagem salva no LocalStorage.");
    } catch (error) {
        console.error("Erro ao salvar garagem no LocalStorage:", error);
        alert("Não foi possível salvar o estado da garagem. Verifique as permissões do LocalStorage.");
    }
}

// Função para carregar a garagem do LocalStorage
function carregarGaragem() {
    const dadosSalvos = localStorage.getItem(GARAGEM_STORAGE_KEY);
    if (dadosSalvos) {
        try {
            const garagemData = JSON.parse(dadosSalvos);
            garagem = garagemData.map(data => {
                // Reconstrói os objetos com base no tipo
                switch (data.tipo) {
                    case 'carro':
                        return Carro.fromData(data);
                    case 'esportivo':
                        return CarroEsportivo.fromData(data);
                    case 'caminhao':
                        return Caminhao.fromData(data);
                    default:
                        console.warn("Tipo de veículo desconhecido encontrado:", data.tipo);
                        return null; // Ignora tipos desconhecidos
                }
            }).filter(v => v !== null); // Remove quaisquer nulos resultantes de erros
            console.log("Garagem carregada do LocalStorage.");
            atualizarListaVeiculos();
            verificarAgendamentosProximos(); // Verifica agendamentos ao carregar
        } catch (error) {
            console.error("Erro ao carregar garagem do LocalStorage:", error);
            alert("Erro ao carregar dados salvos da garagem. Os dados podem estar corrompidos.");
            garagem = []; // Reseta a garagem em caso de erro grave
            localStorage.removeItem(GARAGEM_STORAGE_KEY); // Limpa dados inválidos
        }
    } else {
        console.log("Nenhuma garagem salva encontrada.");
    }
}

// ===== FUNÇÕES DE CRIAÇÃO E INTERFACE =====

// Função unificada para criar veículos
function criarVeiculo(tipo) {
    let novoVeiculo = null;
    let modelo, cor, capacidade; // Declara fora dos cases

    try { // Adiciona try...catch para melhor tratamento de erros
        switch (tipo) {
            case 'carro':
                modelo = document.getElementById("modeloBase").value.trim();
                cor = document.getElementById("corBase").value.trim();
                if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Carro Base.");
                novoVeiculo = new Carro(modelo, cor);
                document.getElementById("statusCarro").textContent = `Carro ${modelo} criado.`;
                document.getElementById("modeloBase").value = ''; // Limpa campos
                document.getElementById("corBase").value = '';
                break;
            case 'esportivo':
                modelo = document.getElementById("modeloEsportivo").value.trim();
                cor = document.getElementById("corEsportivo").value.trim();
                 if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Carro Esportivo.");
                novoVeiculo = new CarroEsportivo(modelo, cor);
                document.getElementById("statusEsportivo").textContent = `Esportivo ${modelo} criado.`;
                document.getElementById("modeloEsportivo").value = '';
                document.getElementById("corEsportivo").value = '';
                break;
            case 'caminhao':
                modelo = document.getElementById("modeloCaminhao").value.trim();
                cor = document.getElementById("corCaminhao").value.trim();
                capacidade = parseInt(document.getElementById("capacidadeCaminhao").value);
                 if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Caminhão.");
                if (isNaN(capacidade) || capacidade <= 0) throw new Error("Capacidade de carga inválida para Caminhão.");
                novoVeiculo = new Caminhao(modelo, cor, capacidade);
                document.getElementById("statusCaminhao").textContent = `Caminhão ${modelo} criado.`;
                document.getElementById("modeloCaminhao").value = '';
                document.getElementById("corCaminhao").value = '';
                document.getElementById("capacidadeCaminhao").value = '';
                break;
            default:
                 console.error("Tipo de veículo desconhecido para criação:", tipo);
                 alert("Erro interno: tipo de veículo inválido.");
                 return; // Sai da função se o tipo for inválido
        }

        if (novoVeiculo) {
            garagem.push(novoVeiculo);
            salvarGaragem();
            atualizarListaVeiculos();
            console.log(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} criado:`, novoVeiculo);
        }
    } catch (error) {
        alert(`Erro ao criar veículo: ${error.message}`);
        console.error("Erro na criação do veículo:", error);
    }
}


// Atualiza a lista de veículos na interface
function atualizarListaVeiculos() {
    const listaDiv = document.getElementById("listaVeiculos");
    listaDiv.innerHTML = ""; // Limpa a lista

    if (garagem.length === 0) {
        listaDiv.innerHTML = "<p>Nenhum veículo na garagem.</p>";
        return;
    }

    garagem.forEach(veiculo => {
        const itemVeiculo = document.createElement("div");
        itemVeiculo.classList.add("veiculo-item-lista"); // Adicionar classe para estilo se necessário
        itemVeiculo.textContent = veiculo.getDescricaoLista();
        itemVeiculo.style.cursor = "pointer";
        itemVeiculo.style.padding = "5px";
        itemVeiculo.style.borderBottom = "1px solid #eee";
        itemVeiculo.onclick = () => selecionarVeiculo(veiculo.id);

        // Adiciona destaque visual se for o selecionado
        if (veiculoSelecionado && veiculo.id === veiculoSelecionado.id) {
            itemVeiculo.style.backgroundColor = "#e0e0e0";
            itemVeiculo.style.fontWeight = "bold";
        }

        listaDiv.appendChild(itemVeiculo);
    });
}

// Seleciona um veículo pelo ID
function selecionarVeiculo(id) {
    const veiculoEncontrado = garagem.find(v => v.id === id);
    if (veiculoEncontrado) {
        veiculoSelecionado = veiculoEncontrado;
        console.log("Veículo selecionado:", veiculoSelecionado);
        exibirInformacoesVeiculoSelecionado();
        atualizarListaVeiculos(); // Atualiza a lista para destacar o selecionado
    } else {
         console.error("Veículo com ID não encontrado:", id);
         veiculoSelecionado = null;
         exibirInformacoesVeiculoSelecionado(); // Limpa a área de seleção
         atualizarListaVeiculos(); // Remove destaque
     }
}

// Exibe as informações do veículo selecionado na área dedicada
function exibirInformacoesVeiculoSelecionado() {
    const areaVeiculoDiv = document.getElementById("areaVeiculoSelecionado");
    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
    const imagemVeiculo = document.getElementById("imagemVeiculo");
    const historicoDiv = document.getElementById("historicoManutencao");
    const agendamentosDiv = document.getElementById("agendamentosFuturos");
    const formAgendamento = document.getElementById("formularioAgendamento");

    if (veiculoSelecionado) {
        areaVeiculoDiv.classList.remove("hidden"); // Mostra a área
        informacoesVeiculoDiv.innerHTML = veiculoSelecionado.exibirInformacoes();
        imagemVeiculo.style.display = "block";

        // Define imagem baseada no tipo
        let imagePath = "";
        switch (veiculoSelecionado.tipo) {
            case "carro": imagePath = "imagens/carro.png"; break;
            case "esportivo": imagePath = "imagens/esportivo.png"; break;
            case "caminhao": imagePath = "imagens/caminhao.png"; break;
            default: imagePath = ""; imagemVeiculo.style.display = "none"; break;
        }
        imagemVeiculo.src = imagePath;
        imagemVeiculo.alt = `Imagem de ${veiculoSelecionado.tipo}`;

        atualizarStatusVisual(veiculoSelecionado);
        atualizarDisplayManutencao(veiculoSelecionado);
        controlarBotoesAcao(); // Habilita/desabilita botões específicos
        formAgendamento.reset(); // Limpa o formulário ao selecionar novo veículo

    } else {
        areaVeiculoDiv.classList.add("hidden"); // Esconde a área
        informacoesVeiculoDiv.innerHTML = "";
        imagemVeiculo.style.display = "none";
        historicoDiv.innerHTML = "<p>Selecione um veículo para ver o histórico.</p>";
        agendamentosDiv.innerHTML = "<p>Selecione um veículo para ver os agendamentos.</p>";
    }
}


// Função genérica para interagir com o veículo SELECIONADO
function interagir(acao) {
    if (!veiculoSelecionado) {
        alert("Nenhum veículo selecionado!");
        return;
    }

    try { // Adiciona try/catch para capturar erros das ações
        switch (acao) {
            case "ligar":
                veiculoSelecionado.ligar();
                break;
            case "desligar":
                veiculoSelecionado.desligar();
                break;
            case "acelerar":
                veiculoSelecionado.acelerar(10); // Incremento padrão
                break;
            case "frear":
                veiculoSelecionado.frear(10); // Decremento padrão
                break;
            case "buzinar":
                veiculoSelecionado.buzinar();
                break;
            case "ativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) {
                    veiculoSelecionado.ativarTurbo();
                } else {
                    alert("Este veículo não tem turbo.");
                }
                break;
            case "desativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) {
                    veiculoSelecionado.desativarTurbo();
                } else {
                    alert("Este veículo não tem turbo.");
                }
                break;
            case "carregar":
                if (veiculoSelecionado instanceof Caminhao) {
                     const cargaStr = prompt(`Quanto carregar? (Capacidade: ${veiculoSelecionado.capacidadeCarga} kg, Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                     if (cargaStr !== null) { // Verifica se o usuário não cancelou
                         const carga = parseFloat(cargaStr); // Usa parseFloat para permitir decimais se necessário
                         if (!isNaN(carga)) {
                             veiculoSelecionado.carregar(carga);
                         } else {
                             alert("Valor de carga inválido.");
                         }
                     }
                 } else {
                    alert("Este veículo não pode ser carregado.");
                }
                break;
            case "descarregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                     const descargaStr = prompt(`Quanto descarregar? (Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                      if (descargaStr !== null) {
                          const descarga = parseFloat(descargaStr);
                           if (!isNaN(descarga)) {
                               veiculoSelecionado.descarregar(descarga);
                           } else {
                               alert("Valor de descarga inválido.");
                           }
                       }
                 } else {
                    alert("Este veículo não pode ser descarregado.");
                }
                break;
            default:
                alert("Ação inválida.");
        }
    } catch (error) {
         alert(`Erro ao executar ação '${acao}': ${error.message}`);
         console.error(`Erro na ação ${acao}:`, error);
     }

    // Atualizar exibição das informações após a ação (se o veículo ainda estiver selecionado)
    if(veiculoSelecionado) {
        exibirInformacoesVeiculoSelecionado();
    }
}

// Controla quais botões de ação estão habilitados/visíveis
function controlarBotoesAcao() {
    if (!veiculoSelecionado) return;

    const ehEsportivo = veiculoSelecionado instanceof CarroEsportivo;
    const ehCaminhao = veiculoSelecionado instanceof Caminhao;

    document.getElementById('btnTurboOn').style.display = ehEsportivo ? 'inline-block' : 'none';
    document.getElementById('btnTurboOff').style.display = ehEsportivo ? 'inline-block' : 'none';
    document.getElementById('btnCarregar').style.display = ehCaminhao ? 'inline-block' : 'none';
    document.getElementById('btnDescarregar').style.display = ehCaminhao ? 'inline-block' : 'none';
}


// Função para atualizar a barra de progresso e o status visual
function atualizarStatusVisual(veiculo) {
     // Garante que estamos atualizando o veículo correto (o selecionado)
     if (!veiculoSelecionado || veiculo.id !== veiculoSelecionado.id) {
         return;
     }

    const velocidadeProgress = document.getElementById("velocidadeProgress");
    const statusVeiculoSpan = document.getElementById("statusVeiculo");
    const velocidadeTexto = document.getElementById("velocidadeTexto");
    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo"); // Para atualizar detalhes como carga/turbo

    // Calcula a porcentagem da velocidade atual em relação à velocidade máxima
    // Evita divisão por zero se velMax for 0 (embora improvável)
    const porcentagemVelocidade = veiculo.velocidadeMaxima > 0
        ? (veiculo.velocidade / veiculo.velocidadeMaxima) * 100
        : 0;
    velocidadeProgress.style.width = Math.min(100, Math.max(0, porcentagemVelocidade)) + "%"; // Garante entre 0 e 100

    // Atualiza o texto da velocidade
    velocidadeTexto.textContent = `${Math.round(veiculo.velocidade)} km/h`; // Arredonda para inteiro

    // Atualiza o status do veículo (Ligado/Desligado)
    if (veiculo.ligado) {
        statusVeiculoSpan.textContent = "Ligado";
        statusVeiculoSpan.className = "status-ligado";
    } else {
        statusVeiculoSpan.textContent = "Desligado";
        statusVeiculoSpan.className = "status-desligado";
    }

     // Re-renderiza as informações para pegar mudanças (carga, turbo status)
     informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoes();
}

// Função para reproduzir os sons
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0; // Reinicia o som para tocar novamente
        sound.play().catch(error => console.warn("Erro ao tocar som:", error)); // Adiciona tratamento de erro
    } else {
        console.warn("Elemento de áudio não encontrado:", soundId);
    }
}

// ===== FUNÇÕES DE MANUTENÇÃO E AGENDAMENTO =====

// Atualiza a exibição do histórico e agendamentos na interface
function atualizarDisplayManutencao(veiculo) {
    const historicoDiv = document.getElementById("historicoManutencao");
    const agendamentosDiv = document.getElementById("agendamentosFuturos");

    historicoDiv.innerHTML = ""; // Limpa
    agendamentosDiv.innerHTML = ""; // Limpa

    if (!veiculo) {
        historicoDiv.innerHTML = "<p>Nenhum veículo selecionado.</p>";
        agendamentosDiv.innerHTML = "<p>Nenhum veículo selecionado.</p>";
        return;
    }

    const { realizadas, futuras, passadas } = veiculo.getHistoricoFormatado();

    // Exibe histórico de realizadas
    if (realizadas.length > 0) {
        realizadas.forEach(item => {
            const p = document.createElement("p");
            p.classList.add("manutencao-item");
            p.textContent = item;
            historicoDiv.appendChild(p);
        });
    } else {
        historicoDiv.innerHTML = "<p>Nenhuma manutenção realizada registrada.</p>";
    }

    // Exibe agendamentos futuros
    if (futuras.length > 0) {
        futuras.forEach(item => {
            const p = document.createElement("p");
            p.classList.add("agendamento-item");
            p.textContent = item;
            agendamentosDiv.appendChild(p);
        });
    } else {
        agendamentosDiv.innerHTML = "<p>Nenhum agendamento futuro.</p>";
    }

    // Opcional: Exibir agendamentos passados (que não foram marcados como realizados)
    if (passadas.length > 0) {
         const passadasTitle = document.createElement('h4');
         passadasTitle.textContent = "Agendamentos Passados (Não Realizados?)";
         passadasTitle.style.marginTop = '10px';
         passadasTitle.style.color = 'orange';
         agendamentosDiv.appendChild(passadasTitle);
         passadas.forEach(item => {
             const p = document.createElement("p");
             p.classList.add("agendamento-item");
             p.style.textDecoration = 'line-through'; // Indica que passou
             p.style.color = '#777';
             p.textContent = item;
             agendamentosDiv.appendChild(p);
         });
     }
}


// Função chamada pelo formulário para AGENDAR manutenção
function agendarManutencao(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    if (!veiculoSelecionado) {
        alert("Selecione um veículo antes de agendar.");
        return;
    }

    const data = document.getElementById("dataAgendamento").value;
    const tipo = document.getElementById("tipoAgendamento").value.trim();
    const custoInput = document.getElementById("custoAgendamento").value; // Custo é opcional ao agendar
    const descricao = document.getElementById("descricaoAgendamento").value.trim();

    // Custo 0 ou null se não preenchido ao agendar
    const custo = custoInput ? parseFloat(custoInput) : null;


    const novaManutencao = new Manutencao(data, tipo, custo, descricao, "Agendada");

    if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
        alert(`Manutenção "${tipo}" agendada para ${new Date(data+'T00:00:00').toLocaleDateString('pt-BR')}!`);
        atualizarDisplayManutencao(veiculoSelecionado); // Atualiza a lista na tela
        document.getElementById("formularioAgendamento").reset(); // Limpa o formulário
        verificarAgendamentosProximos(); // Verifica se o novo agendamento dispara um alerta
    } else {
        // A função adicionarManutencao já deve ter mostrado um alerta de erro de validação
        console.error("Falha ao validar ou adicionar agendamento.");
    }
}

// Função para REGISTRAR manutenção já realizada
function adicionarManutencaoRealizada() {
     if (!veiculoSelecionado) {
         alert("Selecione um veículo antes de registrar manutenção.");
         return;
     }

     const data = document.getElementById("dataAgendamento").value;
     const tipo = document.getElementById("tipoAgendamento").value.trim();
     const custoInput = document.getElementById("custoAgendamento").value; // Custo é OBRIGATÓRIO ao registrar
     const descricao = document.getElementById("descricaoAgendamento").value.trim();

     // Valida custo para manutenção realizada
     const custo = parseFloat(custoInput);
      if (custoInput === '' || isNaN(custo) || custo < 0) {
         alert("Erro: O custo é obrigatório e deve ser um número positivo (ou zero) para registrar uma manutenção realizada.");
         return;
     }

     const novaManutencao = new Manutencao(data, tipo, custo, descricao, "Realizada");

     if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
         alert(`Manutenção "${tipo}" registrada como realizada em ${new Date(data+'T00:00:00').toLocaleDateString('pt-BR')}!`);
         atualizarDisplayManutencao(veiculoSelecionado); // Atualiza a lista na tela
         document.getElementById("formularioAgendamento").reset(); // Limpa o formulário
     } else {
         // A função adicionarManutencao já deve ter mostrado um alerta de erro de validação
         console.error("Falha ao validar ou adicionar manutenção realizada.");
     }
}


// Verifica agendamentos próximos e exibe alertas
function verificarAgendamentosProximos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const umaSemana = new Date(hoje);
    umaSemana.setDate(hoje.getDate() + 7);

    let alertas = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.status === 'Agendada') {
                const dataAgendamento = manutencao.getDataObj();
                if (dataAgendamento) { // Verifica se a data é válida
                    // Compara apenas as datas (ignorando horas)
                     dataAgendamento.setHours(0,0,0,0);

                    if (dataAgendamento.getTime() === hoje.getTime()) {
                        alertas.push(`🚨 HOJE: ${manutencao.tipo} para ${veiculo.modelo} (${veiculo.id})`);
                    } else if (dataAgendamento.getTime() === amanha.getTime()) {
                        alertas.push(`🔔 AMANHÃ: ${manutencao.tipo} para ${veiculo.modelo} (${veiculo.id})`);
                    } else if (dataAgendamento > amanha && dataAgendamento <= umaSemana) {
                         // Alerta menos urgente para a próxima semana (opcional)
                         // console.log(`🗓️ Próxima semana: ${manutencao.tipo} para ${veiculo.modelo} em ${dataAgendamento.toLocaleDateString('pt-BR')}`);
                    }
                }
            }
        });
    });

    if (alertas.length > 0) {
        // Exibe um único alerta com todas as notificações importantes
        alert("Lembretes de Agendamento:\n\n" + alertas.join("\n"));
    }
}


// ===== INICIALIZAÇÃO =====

// Adicionar event listener para carregar a garagem quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function () {
    carregarGaragem(); // Carrega os veículos salvos
    // Inicialmente nenhum veículo selecionado
    exibirInformacoesVeiculoSelecionado();
});

// Garantir que o estado seja salvo ao fechar a página (pode não funcionar em todos os cenários/navegadores)
// window.addEventListener('beforeunload', (event) => {
//     // A ação de salvar pode não completar antes da página fechar
//     // É mais seguro salvar após cada mudança significativa (criar, ligar/desligar, carregar, manutenção)
//      console.log("Tentando salvar antes de descarregar...");
//      salvarGaragem();
// });