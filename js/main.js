/**
 * js/main.js - Lógica Principal da Aplicação Garagem Inteligente
 * Gerencia estado, interações, UI e persistência.
 */

// ===== IMPORTS =====
import { Manutencao } from './classes/Manutencao.js';
import { Carro } from './classes/Carro.js';
import { CarroEsportivo } from './classes/CarroEsportivo.js';
import { Caminhao } from './classes/Caminhao.js';
import { uuidv4, playSound, parsePtBrDate } from './utils.js';

// ===== ESTADO GLOBAL =====
let garagem = []; // Array para os objetos de veículo
let veiculoSelecionado = null; // Referência ao objeto do veículo atualmente selecionado
const GARAGEM_STORAGE_KEY = 'minhaGaragemInteligenteUnificada';

// ===== REFERÊNCIAS DOM (Cache) =====
// Estas são inicializadas antes do DOMContentLoaded, mas type="module" tem comportamento 'defer',
// o que geralmente significa que o DOM estará pronto quando o script for executado.
// No entanto, o acesso principal a eles deve ser feito após a garantia do DOMContentLoaded.
const mainContent = document.getElementById('mainContent');
const viewGaragem = document.getElementById('viewGaragem');
const viewAdicionar = document.getElementById('viewAdicionar');
const viewDetalhesVeiculo = document.getElementById('viewDetalhesVeiculo');
const navGaragemLink = document.getElementById('navGaragem');
const navAdicionarLink = document.getElementById('navAdicionar');
const statusGlobalDiv = document.getElementById('statusGlobal');
const listaVeiculosDiv = document.getElementById("listaVeiculos");
const formAdicionarVeiculo = document.getElementById('formAdicionarVeiculo');
const addTipoVeiculoSelect = document.getElementById('addTipoVeiculo');
const addCamposCaminhaoDiv = document.getElementById('camposCaminhao');
const addCapacidadeInput = document.getElementById('addCapacidade');
const addModeloInput = document.getElementById("addModelo");
const addCorInput = document.getElementById("addCor");
const statusAdicionarP = document.getElementById('statusAdicionar');
// Detalhes View
const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
const imagemVeiculo = document.getElementById("imagemVeiculo");
const velocidadeProgress = document.getElementById("velocidadeProgress");
const velocidadeTexto = document.getElementById("velocidadeTexto");
const statusVeiculoSpan = document.getElementById("statusVeiculo");
const btnLigar = document.querySelector('button[onclick="interagir(\'ligar\')"]');
const btnDesligar = document.querySelector('button[onclick="interagir(\'desligar\')"]');
const btnAcelerar = document.querySelector('button[onclick="interagir(\'acelerar\')"]');
const btnFrear = document.querySelector('button[onclick="interagir(\'frear\')"]');
const btnBuzinar = document.querySelector('button[onclick="interagir(\'buzinar\')"]');
const btnTurboOn = document.getElementById('btnTurboOn');
const btnTurboOff = document.getElementById('btnTurboOff');
const btnCarregar = document.getElementById('btnCarregar');
const btnDescarregar = document.getElementById('btnDescarregar');
const historicoManutencaoDiv = document.getElementById("historicoManutencao");
const agendamentosFuturosDiv = document.getElementById("agendamentosFuturos");
const formularioAgendamento = document.getElementById("formularioAgendamento");
const dataAgendamentoInput = document.getElementById("dataAgendamento");
const tipoAgendamentoInput = document.getElementById("tipoAgendamento");
const custoAgendamentoInput = document.getElementById("custoAgendamento");
const descricaoAgendamentoInput = document.getElementById("descricaoAgendamento");
const btnVoltarGaragem = document.getElementById('btnVoltarGaragem');

// ===== PERSISTÊNCIA (LocalStorage) =====

/**
 * Salva o estado atual da garagem no LocalStorage.
 */
function salvarGaragem() {
    try {
        const garagemParaSalvar = garagem.map(veiculo => {
             const data = { ...veiculo };
             data.historicoManutencao = veiculo.historicoManutencao.map(m => ({...m}));
             return data;
        });
        localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(garagemParaSalvar));
        console.log(`Garagem salva com ${garagem.length} veículo(s).`);
    } catch (error) {
        console.error("Erro fatal ao salvar garagem no LocalStorage:", error);
        mostrarStatusGlobal("ERRO CRÍTICO: Não foi possível salvar a garagem!", "error", 0);
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
        atualizarListaVeiculosUI();
        return;
    }

    try {
        const garagemData = JSON.parse(dadosSalvos);
        if (!Array.isArray(garagemData)) throw new Error("Dados salvos não são um array.");

        garagem = [];

        garagemData.forEach(data => {
             if (!data || !data.tipo) {
                 console.warn("Dado de veículo inválido ou sem tipo encontrado:", data);
                 return;
             }
             let veiculoRecriado = null;
             try {
                 switch (data.tipo) {
                     case 'carro':       veiculoRecriado = Carro.fromData(data); break;
                     case 'esportivo':   veiculoRecriado = CarroEsportivo.fromData(data); break;
                     case 'caminhao':    veiculoRecriado = Caminhao.fromData(data); break;
                     default:
                         console.warn("Tipo de veículo desconhecido encontrado:", data.tipo);
                 }
                 if (veiculoRecriado instanceof Carro) {
                     garagem.push(veiculoRecriado);
                 } else if (veiculoRecriado === null) {
                      console.warn(`Falha ao recriar veículo a partir dos dados:`, data);
                 }
             } catch (creationError) {
                 console.error(`Erro crítico ao recriar veículo ${data.modelo} (${data.tipo}):`, creationError);
             }
         });

        console.log(`Garagem carregada. ${garagem.length} veículo(s) recriado(s) com sucesso.`);
        mostrarStatusGlobal(`Garagem carregada com ${garagem.length} veículo(s).`, "success");

    } catch (error) {
        console.error("Erro ao carregar/parsear garagem do LocalStorage:", error);
        mostrarStatusGlobal("Erro ao carregar dados salvos. Resetando garagem.", "error");
        garagem = [];
        localStorage.removeItem(GARAGEM_STORAGE_KEY);
    } finally {
        atualizarListaVeiculosUI();
        verificarAgendamentosProximos();
    }
}

// ===== CONTROLE DA INTERFACE (UI) E NAVEGAÇÃO =====

/**
 * Mostra uma mensagem de status na área global (sidebar).
 */
function mostrarStatusGlobal(message, type = 'info', duration = 4000) {
    if (!statusGlobalDiv) {
        console.error("Elemento statusGlobalDiv não encontrado. Mensagem não exibida:", message);
        return;
    }

    statusGlobalDiv.textContent = message;
    statusGlobalDiv.className = `status-area ${type}`;

    if (statusGlobalDiv.timerId) {
        clearTimeout(statusGlobalDiv.timerId);
    }

    if (duration > 0) {
        statusGlobalDiv.timerId = setTimeout(() => {
            if (statusGlobalDiv.textContent === message) {
                statusGlobalDiv.textContent = 'Pronto.';
                statusGlobalDiv.className = 'status-area';
            }
            statusGlobalDiv.timerId = null;
        }, duration);
    } else {
        statusGlobalDiv.timerId = null;
    }

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.scrollTop = 0;
}

/**
 * Alterna a visibilidade das views principais no mainContent.
 */
function switchView(viewToShow) {
    if (!viewGaragem || !viewAdicionar || !viewDetalhesVeiculo || !navGaragemLink || !navAdicionarLink) {
        console.error("Elementos de view ou navegação não encontrados. Não é possível alternar a view.");
        return;
    }
    viewGaragem.classList.add('hidden');
    viewAdicionar.classList.add('hidden');
    viewDetalhesVeiculo.classList.add('hidden');
    navGaragemLink.classList.remove('active');
    navAdicionarLink.classList.remove('active');

    switch (viewToShow) {
        case 'garagem':
            viewGaragem.classList.remove('hidden');
            navGaragemLink.classList.add('active');
            veiculoSelecionado = null;
            atualizarListaVeiculosUI();
            if (mainContent) mainContent.scrollTop = 0;
            break;
        case 'adicionar':
            viewAdicionar.classList.remove('hidden');
            navAdicionarLink.classList.add('active');
            if (formAdicionarVeiculo) formAdicionarVeiculo.reset();
            if (statusAdicionarP) statusAdicionarP.textContent = '';
            toggleCamposCaminhao();
            if (mainContent) mainContent.scrollTop = 0;
            if (addModeloInput) addModeloInput.focus();
            break;
        case 'detalhes':
            if (veiculoSelecionado) {
                viewDetalhesVeiculo.classList.remove('hidden');
                exibirInformacoesVeiculoSelecionado();
                if (mainContent) mainContent.scrollTop = 0;
            } else {
                console.warn("Tentativa de mostrar detalhes sem veículo selecionado.");
                switchView('garagem');
            }
            break;
        default:
            console.error("View desconhecida:", viewToShow);
            switchView('garagem');
    }
}

/**
 * Atualiza a lista de veículos na UI (View Garagem).
 */
function atualizarListaVeiculosUI() {
    if (!listaVeiculosDiv) return;
    listaVeiculosDiv.innerHTML = "";

    if (garagem.length === 0) {
        listaVeiculosDiv.innerHTML = "<p>Sua garagem está vazia. Adicione um veículo!</p>";
        return;
    }

    const garagemOrdenada = [...garagem].sort((a, b) => a.modelo.localeCompare(b.modelo));

    garagemOrdenada.forEach(veiculo => {
        const itemVeiculo = document.createElement("div");
        itemVeiculo.classList.add("veiculo-item-lista");
        itemVeiculo.dataset.id = veiculo.id;
        itemVeiculo.dataset.tipo = veiculo.tipo;
        itemVeiculo.textContent = veiculo.getDescricaoLista();
        itemVeiculo.setAttribute('role', 'button');
        itemVeiculo.setAttribute('tabindex', '0');

        itemVeiculo.onclick = () => selecionarVeiculo(veiculo.id);
        itemVeiculo.onkeydown = (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 selecionarVeiculo(veiculo.id);
             }
         };
        listaVeiculosDiv.appendChild(itemVeiculo);
    });
}

/**
 * Seleciona um veículo pelo ID e muda para a view de detalhes.
 */
function selecionarVeiculo(id) {
    const veiculoEncontrado = garagem.find(v => v.id === id);
    if (veiculoEncontrado) {
        veiculoSelecionado = veiculoEncontrado;
        console.log("Veículo selecionado:", veiculoSelecionado.modelo, veiculoSelecionado.id);
        switchView('detalhes');
    } else {
        console.error("Veículo com ID não encontrado para seleção:", id);
        mostrarStatusGlobal("Erro: Veículo não encontrado.", "error");
        veiculoSelecionado = null;
        switchView('garagem');
    }
}

// ===== VIEW DE DETALHES E INTERAÇÃO =====

/**
 * Exibe as informações e atualiza a UI da view de detalhes para o veículo selecionado.
 */
function exibirInformacoesVeiculoSelecionado() {
    if (!veiculoSelecionado || (viewDetalhesVeiculo && viewDetalhesVeiculo.classList.contains('hidden'))) {
        console.warn("Tentativa de exibir detalhes sem veículo selecionado ou view oculta.");
        if (viewDetalhesVeiculo && !viewDetalhesVeiculo.classList.contains('hidden') && !veiculoSelecionado) {
             switchView('garagem');
         }
        return;
    }

    try {
        if (informacoesVeiculoDiv) informacoesVeiculoDiv.innerHTML = veiculoSelecionado.exibirInformacoesDetalhes();

        if (imagemVeiculo) {
            let imagePath = `imagens/${veiculoSelecionado.tipo}.png`;
            imagemVeiculo.src = imagePath;
            imagemVeiculo.alt = `Imagem de um ${veiculoSelecionado.tipo} ${veiculoSelecionado.modelo}`;
            imagemVeiculo.style.display = "block";
            imagemVeiculo.onerror = () => {
                 imagemVeiculo.style.display = 'none';
                 console.warn(`Imagem não encontrada: ${imagePath}`);
             };
        }

        atualizarStatusVisual(veiculoSelecionado);
        atualizarDisplayManutencao(veiculoSelecionado);
        controlarBotoesAcaoVisibilidade();
        controlarBotoesAcaoEstado(veiculoSelecionado);

        if (formularioAgendamento) formularioAgendamento.reset();

    } catch (error) {
         console.error("Erro ao exibir informações do veículo selecionado:", error);
         mostrarStatusGlobal("Erro ao carregar detalhes do veículo.", "error");
    }
}

/**
 * Atualiza os elementos visuais dinâmicos (velocímetro, status on/off, etc.).
 */
function atualizarStatusVisual(veiculo) {
    if (!veiculoSelecionado || !veiculo || veiculo.id !== veiculoSelecionado.id || (viewDetalhesVeiculo && viewDetalhesVeiculo.classList.contains('hidden'))) {
        return;
    }

    if (!velocidadeProgress || !statusVeiculoSpan || !velocidadeTexto || !informacoesVeiculoDiv) {
        console.error("Elementos da UI para status visual não encontrados.");
        return;
    }

    try {
        const velMax = veiculo.velocidadeMaxima > 0 ? veiculo.velocidadeMaxima : 1;
        const porcentagemVelocidade = Math.min(100, Math.max(0, (veiculo.velocidade / velMax) * 100));
        velocidadeProgress.style.width = `${porcentagemVelocidade}%`;
        velocidadeTexto.textContent = `${Math.round(veiculo.velocidade)} km/h`;

        statusVeiculoSpan.textContent = veiculo.ligado ? "Ligado" : "Desligado";
        statusVeiculoSpan.className = veiculo.ligado ? "status-ligado" : "status-desligado";

        informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoesDetalhes();
        controlarBotoesAcaoEstado(veiculo);

    } catch (error) {
         console.error("Erro ao atualizar status visual:", error);
    }
}

/**
 * Controla a VISIBILIDADE dos botões específicos (Turbo, Carga) baseado no TIPO.
 */
function controlarBotoesAcaoVisibilidade() {
    if (!veiculoSelecionado) return;
    const ehEsportivo = veiculoSelecionado instanceof CarroEsportivo;
    const ehCaminhao = veiculoSelecionado instanceof Caminhao;

    if (btnTurboOn) btnTurboOn.classList.toggle('hidden', !ehEsportivo);
    if (btnTurboOff) btnTurboOff.classList.toggle('hidden', !ehEsportivo);
    if (btnCarregar) btnCarregar.classList.toggle('hidden', !ehCaminhao);
    if (btnDescarregar) btnDescarregar.classList.toggle('hidden', !ehCaminhao);
}

/**
 * Controla o ESTADO (habilitado/desabilitado) dos botões baseado no ESTADO do veículo.
 */
function controlarBotoesAcaoEstado(veiculo) {
    if (!veiculo || !btnLigar) return;

    const ligado = veiculo.ligado;
    const parado = veiculo.velocidade === 0;

    btnLigar.disabled = ligado;
    if (btnDesligar) btnDesligar.disabled = !ligado || !parado;
    if (btnAcelerar) btnAcelerar.disabled = !ligado;
    if (btnFrear) btnFrear.disabled = !ligado && parado;
    if (btnBuzinar) btnBuzinar.disabled = false;

    if (veiculo instanceof CarroEsportivo && btnTurboOn && btnTurboOff) {
        btnTurboOn.disabled = !ligado || veiculo.turboAtivado;
        btnTurboOff.disabled = !ligado || !veiculo.turboAtivado;
    }
    if (veiculo instanceof Caminhao && btnCarregar && btnDescarregar) {
        btnCarregar.disabled = ligado || veiculo.cargaAtual >= veiculo.capacidadeCarga;
        btnDescarregar.disabled = ligado || veiculo.cargaAtual <= 0;
    }
}

/**
 * Função unificada para interagir com o veículo selecionado.
 */
function interagir(acao) {
    if (!veiculoSelecionado) {
        mostrarStatusGlobal("Nenhum veículo selecionado para interagir!", "error");
        return;
    }

    console.log(`Tentando ação: ${acao} em ${veiculoSelecionado.modelo}`);
    let saveNeeded = false;
    let updateVisualNeeded = true;
    let statusMsg = { text: '', type: 'info' };

    try {
        switch (acao) {
            case "ligar":
                veiculoSelecionado.ligar();
                playSound("somLigar");
                statusMsg = { text: `${veiculoSelecionado.modelo} ligado.`, type: 'success' };
                saveNeeded = true;
                break;
            case "desligar":
                veiculoSelecionado.desligar();
                playSound("somDesligar");
                statusMsg = { text: `${veiculoSelecionado.modelo} desligado.`, type: 'success' };
                saveNeeded = true;
                break;
            case "acelerar":
                const velAposAcelerar = veiculoSelecionado.acelerar(15);
                if (velAposAcelerar > 0 && veiculoSelecionado.velocidade > 0) playSound("somAcelerar"); // Toca se acelerou e não estava no max
                break;
            case "frear":
                const velAtualAntesFrear = veiculoSelecionado.velocidade;
                const velAposFrear = veiculoSelecionado.frear(20);
                if (velAposFrear < velAtualAntesFrear) playSound("somFrear");
                if (velAposFrear === 0) {
                    statusMsg = { text: `${veiculoSelecionado.modelo} parado.`, type: 'success' };
                    saveNeeded = true;
                }
                break;
            case "buzinar":
                veiculoSelecionado.buzinar();
                playSound("somBuzina");
                statusMsg = { text: `${veiculoSelecionado.modelo} buzinou!`, type: 'success' };
                updateVisualNeeded = false;
                break;
            case "ativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) {
                    veiculoSelecionado.ativarTurbo();
                    statusMsg = { text: "Turbo Ativado!", type: 'success' };
                    saveNeeded = true;
                } else { throw new Error("Este veículo não possui turbo."); }
                break;
            case "desativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) {
                    const result = veiculoSelecionado.desativarTurbo();
                    statusMsg = { text: result.message, type: 'success' };
                    saveNeeded = true;
                } else { throw new Error("Este veículo não possui turbo."); }
                break;
            case "carregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                      const cargaStr = prompt(`Quanto carregar? (Capacidade: ${veiculoSelecionado.capacidadeCarga}kg, Atual: ${veiculoSelecionado.cargaAtual}kg, Restante: ${veiculoSelecionado.capacidadeCarga - veiculoSelecionado.cargaAtual}kg)`);
                      if (cargaStr !== null) {
                           const carga = parseFloat(cargaStr);
                           const result = veiculoSelecionado.carregar(carga);
                           statusMsg = { text: result.message, type: 'success' };
                           saveNeeded = true;
                      } else { updateVisualNeeded = false; }
                 } else { throw new Error("Este veículo não pode ser carregado."); }
                 break;
            case "descarregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                      const descargaStr = prompt(`Quanto descarregar? (Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                      if (descargaStr !== null) {
                          const descarga = parseFloat(descargaStr);
                          const result = veiculoSelecionado.descarregar(descarga);
                          statusMsg = { text: result.message, type: 'success' };
                          saveNeeded = true;
                      } else { updateVisualNeeded = false; }
                 } else { throw new Error("Este veículo não pode ser descarregado."); }
                 break;
            default:
                console.warn("Ação de interação desconhecida:", acao);
                statusMsg = { text: `Ação "${acao}" não reconhecida.`, type: 'error' };
                updateVisualNeeded = false;
        }

        if (statusMsg.text) {
             mostrarStatusGlobal(statusMsg.text, statusMsg.type);
        }

    } catch (error) {
        console.error(`Erro ao executar ação '${acao}' no veículo ${veiculoSelecionado.modelo}:`, error);
        mostrarStatusGlobal(error.message || "Erro inesperado durante a ação.", "error");
        updateVisualNeeded = true;
    } finally {
         if (updateVisualNeeded && veiculoSelecionado) {
             atualizarStatusVisual(veiculoSelecionado);
         }
         if (saveNeeded) {
             salvarGaragem();
         }
    }
}

// ===== CRIAÇÃO DE VEÍCULOS (View Adicionar) =====

/**
 * Mostra ou esconde os campos específicos para caminhão no formulário de adição.
 */
function toggleCamposCaminhao() {
    if (!addTipoVeiculoSelect || !addCamposCaminhaoDiv || !addCapacidadeInput) return;
    const tipoSelecionado = addTipoVeiculoSelect.value;
    const ehCaminhao = tipoSelecionado === 'caminhao';
    addCamposCaminhaoDiv.classList.toggle('hidden', !ehCaminhao);
    addCapacidadeInput.required = ehCaminhao;
    if (!ehCaminhao) {
        addCapacidadeInput.value = '';
    }
}

/**
 * Cria um novo veículo a partir do formulário.
 */
function criarVeiculoUnificado(event) {
    event.preventDefault();
    if (!statusAdicionarP || !addTipoVeiculoSelect || !addModeloInput || !addCorInput || !formAdicionarVeiculo) return;

    statusAdicionarP.textContent = '';
    statusAdicionarP.className = 'form-status';

    const tipo = addTipoVeiculoSelect.value;
    const modelo = addModeloInput.value.trim();
    const cor = addCorInput.value.trim();
    const id = uuidv4();

    let novoVeiculo = null;
    let capacidade = null;

    try {
        if (!modelo) {
             if(addModeloInput) addModeloInput.focus();
             throw new Error("Modelo é obrigatório.");
         }
         if (!cor) {
              if(addCorInput) addCorInput.focus();
              throw new Error("Cor é obrigatória.");
          }

        switch (tipo) {
            case 'carro':
                novoVeiculo = new Carro(modelo, cor, id);
                break;
            case 'esportivo':
                novoVeiculo = new CarroEsportivo(modelo, cor, id);
                break;
            case 'caminhao':
                capacidade = parseInt(addCapacidadeInput.value);
                if (isNaN(capacidade) || capacidade <= 0) {
                     if(addCapacidadeInput) addCapacidadeInput.focus();
                     throw new Error("Capacidade de carga inválida (deve ser número positivo).");
                 }
                novoVeiculo = new Caminhao(modelo, cor, capacidade, id);
                break;
            default:
                throw new Error("Tipo de veículo inválido selecionado.");
        }

        garagem.push(novoVeiculo);
        salvarGaragem();
        atualizarListaVeiculosUI();

        console.log(`${novoVeiculo.tipo.charAt(0).toUpperCase() + novoVeiculo.tipo.slice(1)} ${novoVeiculo.modelo} criado.`);
        statusAdicionarP.textContent = `${novoVeiculo.tipo.charAt(0).toUpperCase() + novoVeiculo.tipo.slice(1)} "${modelo}" adicionado com sucesso!`;
        statusAdicionarP.classList.add('success');
        mostrarStatusGlobal(`${novoVeiculo.tipo} ${modelo} adicionado!`, 'success');

        formAdicionarVeiculo.reset();
        toggleCamposCaminhao();

        setTimeout(() => {
             if (viewAdicionar && !viewAdicionar.classList.contains('hidden')) {
                 switchView('garagem');
             }
         }, 1500);

    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        statusAdicionarP.textContent = `Erro: ${error.message}`;
        statusAdicionarP.classList.add('error');
        mostrarStatusGlobal(`Falha ao adicionar: ${error.message}`, 'error');
    }
}

// ===== MANUTENÇÃO E AGENDAMENTO =====

/**
 * Atualiza a exibição do histórico e agendamentos na view de detalhes.
 */
function atualizarDisplayManutencao(veiculo) {
    if (!historicoManutencaoDiv || !agendamentosFuturosDiv) return;

    historicoManutencaoDiv.innerHTML = "<p>Nenhuma manutenção realizada registrada.</p>";
    agendamentosFuturosDiv.innerHTML = "<p>Nenhum agendamento futuro.</p>";

    if (!veiculo) return;

    try {
        const { realizadas, futuras, passadas } = veiculo.getHistoricoFormatado(parsePtBrDate);

        if (realizadas.length > 0) {
            historicoManutencaoDiv.innerHTML = "";
            realizadas.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("manutencao-item");
                div.textContent = item;
                historicoManutencaoDiv.appendChild(div);
            });
        }

        let hasAgendamentos = false;
        if (futuras.length > 0) {
             if (!hasAgendamentos) agendamentosFuturosDiv.innerHTML = "";
             hasAgendamentos = true;
             futuras.forEach(item => {
                 const div = document.createElement("div");
                 div.classList.add("agendamento-item", "futuro");
                 div.textContent = item;
                 agendamentosFuturosDiv.appendChild(div);
             });
         }

         if (passadas.length > 0) {
             if (!hasAgendamentos) agendamentosFuturosDiv.innerHTML = "";
             hasAgendamentos = true;
             if (futuras.length > 0) {
                  const separador = document.createElement('hr');
                  separador.style.margin = '10px 0';
                  agendamentosFuturosDiv.appendChild(separador);
             }
              const passadasTitle = document.createElement('div');
              passadasTitle.textContent = "Agendamentos Passados:";
              passadasTitle.style.fontWeight = 'bold';
              passadasTitle.style.marginTop = futuras.length > 0 ? '0' : '10px';
              passadasTitle.style.marginBottom = '5px';
              passadasTitle.style.color = '#6c757d';
              agendamentosFuturosDiv.appendChild(passadasTitle);

             passadas.forEach(item => {
                 const div = document.createElement("div");
                 div.classList.add("agendamento-item", "passado");
                 div.textContent = item;
                 agendamentosFuturosDiv.appendChild(div);
             });
         }

    } catch (error) {
         console.error("Erro ao atualizar display de manutenção:", error);
         historicoManutencaoDiv.innerHTML = "<p style='color:red;'>Erro ao carregar histórico.</p>";
         agendamentosFuturosDiv.innerHTML = "<p style='color:red;'>Erro ao carregar agendamentos.</p>";
         mostrarStatusGlobal("Erro ao exibir dados de manutenção.", "error");
    }
}

/**
 * Adiciona um registro de manutenção (agendada ou realizada) via formulário.
 */
function adicionarManutencaoForm(event, status) {
    event.preventDefault(); // Previne o submit padrão do formulário se for um evento de submit
    if (!veiculoSelecionado) {
        mostrarStatusGlobal("Selecione um veículo.", "error");
        return;
    }
    if (!dataAgendamentoInput || !tipoAgendamentoInput || !custoAgendamentoInput || !descricaoAgendamentoInput || !formularioAgendamento) {
        mostrarStatusGlobal("Erro: Elementos do formulário de manutenção não encontrados.", "error");
        return;
    }

    const data = dataAgendamentoInput.value;
    const tipo = tipoAgendamentoInput.value.trim();
    const custoStr = custoAgendamentoInput.value;
    const descricao = descricaoAgendamentoInput.value.trim();
    let custo = null;

    if (status === 'Realizada') {
        custo = parseFloat(custoStr);
        if (custoStr === '' || isNaN(custo) || custo < 0) {
            mostrarStatusGlobal("Custo é obrigatório e deve ser positivo (ou zero) para manutenção realizada.", "error");
            custoAgendamentoInput.focus();
            return;
        }
    } else {
        custo = (custoStr && !isNaN(parseFloat(custoStr)) && parseFloat(custoStr) >= 0)
                ? parseFloat(custoStr)
                : null;
    }

    const novaManutencao = new Manutencao(data, tipo, custo, descricao, status);
    const validacao = novaManutencao.validar();
    if (!validacao.isValid) {
        mostrarStatusGlobal(validacao.message, "error");
        if (validacao.message.includes("tipo")) tipoAgendamentoInput.focus();
        else if (validacao.message.includes("data")) dataAgendamentoInput.focus();
        else if (validacao.message.includes("Custo")) custoAgendamentoInput.focus();
        return;
    }

    if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
         salvarGaragem();
         atualizarDisplayManutencao(veiculoSelecionado);
         formularioAgendamento.reset();

         const dataObj = parsePtBrDate(data); // parsePtBrDate espera dd/mm/yyyy, input date é yyyy-mm-dd
         let dataFormatadaParaMsg = data; // Fallback
         if (dataObj) { // Se parsePtBrDate for adaptado para yyyy-mm-dd ou uma nova função for usada
            dataFormatadaParaMsg = dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC'});
         } else { // Se não, tentamos formatar yyyy-mm-dd para dd/mm/yyyy manualmente para a msg
            const parts = data.split('-');
            if(parts.length === 3) dataFormatadaParaMsg = `${parts[2]}/${parts[1]}/${parts[0]}`;
         }

         const acao = status === 'Agendada' ? 'agendada' : 'registrada como realizada';
         mostrarStatusGlobal(`Manutenção "${tipo}" ${acao} para ${dataFormatadaParaMsg}!`, "success");

         if (status === 'Agendada') {
             verificarAgendamentosProximos();
         }
    } else {
         mostrarStatusGlobal("Erro interno ao adicionar manutenção.", "error");
    }
}

/**
 * Verifica agendamentos próximos e exibe alertas.
 */
function verificarAgendamentosProximos() {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setUTCDate(hoje.getUTCDate() + 1);

    let alertasHoje = [];
    let alertasAmanha = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.status === 'Agendada') {
                const dataAgendamento = manutencao.getDataObj();
                if (dataAgendamento) {
                    dataAgendamento.setUTCHours(0,0,0,0);

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
        mostrarStatusGlobal(`Lembretes: ${todosAlertas.join(' | ')}`, 'info', 10000);
    }
}


// ===== INICIALIZAÇÃO E EVENT LISTENERS GLOBAIS =====

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM carregado. Iniciando Garagem Inteligente...");

    try {
        // --- Listeners de Navegação ---
        if (navGaragemLink) navGaragemLink.addEventListener('click', (e) => { e.preventDefault(); switchView('garagem'); });
        if (navAdicionarLink) navAdicionarLink.addEventListener('click', (e) => { e.preventDefault(); switchView('adicionar'); });
        if (btnVoltarGaragem) btnVoltarGaragem.addEventListener('click', () => switchView('garagem'));

        // --- Listeners do Formulário Adicionar ---
        if (addTipoVeiculoSelect) addTipoVeiculoSelect.addEventListener('change', toggleCamposCaminhao);
        if (formAdicionarVeiculo) formAdicionarVeiculo.addEventListener('submit', criarVeiculoUnificado);

        // --- Listeners do Formulário de Manutenção ---
        const btnSubmitAgendar = document.getElementById('btnSubmitAgendar');
        const btnSubmitRealizada = document.getElementById('btnSubmitRealizada');

        if (formularioAgendamento && btnSubmitAgendar) {
            formularioAgendamento.addEventListener('submit', (e) => {
                adicionarManutencaoForm(e, 'Agendada');
            });
        }
        if (formularioAgendamento && btnSubmitRealizada) {
            btnSubmitRealizada.addEventListener('click', (e) => {
                adicionarManutencaoForm(e, 'Realizada');
            });
        }

        // --- Carregar Dados e Iniciar ---
        console.log("Antes de carregarGaragem()");
        carregarGaragem();
        console.log("Depois de carregarGaragem(), antes de switchView('garagem')");
        switchView('garagem');
        console.log("Depois de switchView('garagem'), antes de mostrarStatusGlobal final");

        mostrarStatusGlobal("Sistema pronto.", "success", 2000);
        console.log("Garagem Inteligente inicializada com sucesso.");

    } catch (error) {
        console.error("ERRO CRÍTICO DURANTE A INICIALIZAÇÃO DO DOMContentLoaded:", error);
        const statusDiv = document.getElementById('statusGlobal'); // Tenta pegar de novo
        if (statusDiv) {
            statusDiv.textContent = "ERRO CRÍTICO NA INICIALIZAÇÃO. Verifique o console.";
            statusDiv.className = "status-area error";
        }
    }
});

// Disponibilizar `interagir` globalmente para os botões com onclick="interagir(...)"
window.interagir = interagir;

// As outras funções como criarVeiculoUnificado e adicionarManutencaoForm são chamadas
// por event listeners configurados aqui no JS, então não precisam estar no escopo global (window).