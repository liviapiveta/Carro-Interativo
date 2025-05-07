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
        // Mapeia a garagem para um formato serializável (objetos planos)
        // Os objetos Manutencao dentro de cada veículo também precisam ser planos
        const garagemParaSalvar = garagem.map(veiculo => {
             const data = { ...veiculo }; // Cria cópia plana do veículo
             // Garante que o histórico de manutenção também seja salvo como objetos planos
             data.historicoManutencao = veiculo.historicoManutencao.map(m => ({...m}));
             return data;
        });
        localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(garagemParaSalvar));
        console.log(`Garagem salva com ${garagem.length} veículo(s).`);
    } catch (error) {
        console.error("Erro fatal ao salvar garagem no LocalStorage:", error);
        mostrarStatusGlobal("ERRO CRÍTICO: Não foi possível salvar a garagem!", "error", 0); // Permanente
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

        // Limpa a garagem atual antes de carregar
        garagem = [];

        garagemData.forEach(data => {
             if (!data || !data.tipo) {
                 console.warn("Dado de veículo inválido ou sem tipo encontrado:", data);
                 return; // Ignora dados inválidos
             }
             let veiculoRecriado = null;
             // Reconstrói os objetos usando os métodos estáticos fromData das classes
             try {
                 switch (data.tipo) {
                     case 'carro':       veiculoRecriado = Carro.fromData(data); break;
                     case 'esportivo':   veiculoRecriado = CarroEsportivo.fromData(data); break;
                     case 'caminhao':    veiculoRecriado = Caminhao.fromData(data); break;
                     default:
                         console.warn("Tipo de veículo desconhecido encontrado:", data.tipo);
                 }
                 if (veiculoRecriado instanceof Carro) { // Verifica se a recriação foi bem sucedida
                     garagem.push(veiculoRecriado);
                 } else if (veiculoRecriado === null) {
                      console.warn(`Falha ao recriar veículo a partir dos dados:`, data);
                 }

             } catch (creationError) {
                 // Captura erros que podem ocorrer dentro do fromData (ex: validação de capacidade no caminhao)
                 console.error(`Erro crítico ao recriar veículo ${data.modelo} (${data.tipo}):`, creationError);
                 // Opcional: notificar usuário sobre falha específica de um veículo
             }
         });

        console.log(`Garagem carregada. ${garagem.length} veículo(s) recriado(s) com sucesso.`);
        mostrarStatusGlobal(`Garagem carregada com ${garagem.length} veículo(s).`, "success");

    } catch (error) {
        console.error("Erro ao carregar/parsear garagem do LocalStorage:", error);
        mostrarStatusGlobal("Erro ao carregar dados salvos. Resetando garagem.", "error");
        garagem = []; // Reseta a garagem em caso de erro grave
        localStorage.removeItem(GARAGEM_STORAGE_KEY); // Limpa dados inválidos
    } finally {
        // Sempre atualiza a UI e verifica agendamentos após tentar carregar
        atualizarListaVeiculosUI();
        verificarAgendamentosProximos();
    }
}

// ===== CONTROLE DA INTERFACE (UI) E NAVEGAÇÃO =====

/**
 * Mostra uma mensagem de status na área global (sidebar).
 */
function mostrarStatusGlobal(message, type = 'info', duration = 4000) {
    if (!statusGlobalDiv) return;

    statusGlobalDiv.textContent = message;
    statusGlobalDiv.className = `status-area ${type}`; // Aplica classe de estilo

    // Limpa timer anterior, se houver
    if (statusGlobalDiv.timerId) {
        clearTimeout(statusGlobalDiv.timerId);
    }

    if (duration > 0) {
        statusGlobalDiv.timerId = setTimeout(() => {
            if (statusGlobalDiv.textContent === message) { // Só limpa se for a mesma mensagem
                statusGlobalDiv.textContent = 'Pronto.';
                statusGlobalDiv.className = 'status-area';
            }
            statusGlobalDiv.timerId = null;
        }, duration);
    } else {
        statusGlobalDiv.timerId = null; // Mensagem permanente
    }

    // Rola a view da sidebar para o topo para garantir visibilidade do status
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.scrollTop = 0;
}

/**
 * Alterna a visibilidade das views principais no mainContent.
 */
function switchView(viewToShow) {
    viewGaragem.classList.add('hidden');
    viewAdicionar.classList.add('hidden');
    viewDetalhesVeiculo.classList.add('hidden');
    navGaragemLink.classList.remove('active');
    navAdicionarLink.classList.remove('active');

    switch (viewToShow) {
        case 'garagem':
            viewGaragem.classList.remove('hidden');
            navGaragemLink.classList.add('active');
            veiculoSelecionado = null; // Desseleciona ao voltar
            atualizarListaVeiculosUI(); // Garante atualização
            mainContent.scrollTop = 0;
            break;
        case 'adicionar':
            viewAdicionar.classList.remove('hidden');
            navAdicionarLink.classList.add('active');
            formAdicionarVeiculo.reset();
            statusAdicionarP.textContent = '';
            toggleCamposCaminhao(); // Garante estado inicial correto
            mainContent.scrollTop = 0;
            addModeloInput.focus(); // Foco no primeiro campo
            break;
        case 'detalhes':
            if (veiculoSelecionado) {
                viewDetalhesVeiculo.classList.remove('hidden');
                exibirInformacoesVeiculoSelecionado();
                mainContent.scrollTop = 0;
            } else {
                console.warn("Tentativa de mostrar detalhes sem veículo selecionado.");
                switchView('garagem'); // Volta para a lista
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
    listaVeiculosDiv.innerHTML = ""; // Limpa

    if (garagem.length === 0) {
        listaVeiculosDiv.innerHTML = "<p>Sua garagem está vazia. Adicione um veículo!</p>";
        return;
    }

    // Ordena alfabeticamente pelo modelo para exibição
    const garagemOrdenada = [...garagem].sort((a, b) => a.modelo.localeCompare(b.modelo));

    garagemOrdenada.forEach(veiculo => {
        const itemVeiculo = document.createElement("div");
        itemVeiculo.classList.add("veiculo-item-lista");
        itemVeiculo.dataset.id = veiculo.id;
        itemVeiculo.dataset.tipo = veiculo.tipo; // Para estilização CSS com ícones
        itemVeiculo.textContent = veiculo.getDescricaoLista(); // Modelo (Cor)
        itemVeiculo.setAttribute('role', 'button');
        itemVeiculo.setAttribute('tabindex', '0'); // Acessibilidade

        itemVeiculo.onclick = () => selecionarVeiculo(veiculo.id);
        itemVeiculo.onkeydown = (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault(); // Evita scroll da página com espaço
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
        switchView('garagem'); // Volta para a lista
    }
}

// ===== VIEW DE DETALHES E INTERAÇÃO =====

/**
 * Exibe as informações e atualiza a UI da view de detalhes para o veículo selecionado.
 */
function exibirInformacoesVeiculoSelecionado() {
    if (!veiculoSelecionado || viewDetalhesVeiculo.classList.contains('hidden')) {
        console.warn("Tentativa de exibir detalhes sem veículo selecionado ou view oculta.");
        if (!viewDetalhesVeiculo.classList.contains('hidden') && !veiculoSelecionado) {
             switchView('garagem');
         }
        return;
    }

    try {
        // Informações textuais (usa método polimórfico)
        informacoesVeiculoDiv.innerHTML = veiculoSelecionado.exibirInformacoesDetalhes();

        // Imagem
        let imagePath = `imagens/${veiculoSelecionado.tipo}.png`;
        imagemVeiculo.src = imagePath;
        imagemVeiculo.alt = `Imagem de um ${veiculoSelecionado.tipo} ${veiculoSelecionado.modelo}`;
        imagemVeiculo.style.display = "block";
        imagemVeiculo.onerror = () => {
             imagemVeiculo.style.display = 'none'; // Esconde se não carregar
             console.warn(`Imagem não encontrada: ${imagePath}`);
         };

        // Status visual (velocidade, ligado/desligado, etc.)
        atualizarStatusVisual(veiculoSelecionado);

        // Histórico e agendamentos de manutenção
        atualizarDisplayManutencao(veiculoSelecionado);

        // Visibilidade dos botões específicos (Turbo, Carga)
        controlarBotoesAcaoVisibilidade();

        // Estado inicial dos botões (habilitado/desabilitado)
        controlarBotoesAcaoEstado(veiculoSelecionado);

        // Limpa o formulário de agendamento/registro
        formularioAgendamento.reset();

    } catch (error) {
         console.error("Erro ao exibir informações do veículo selecionado:", error);
         mostrarStatusGlobal("Erro ao carregar detalhes do veículo.", "error");
         // switchView('garagem'); // Considerar voltar para garagem em caso de erro grave
    }
}

/**
 * Atualiza os elementos visuais dinâmicos (velocímetro, status on/off, etc.).
 */
function atualizarStatusVisual(veiculo) {
    if (!veiculoSelecionado || !veiculo || veiculo.id !== veiculoSelecionado.id || viewDetalhesVeiculo.classList.contains('hidden')) {
        return; // Só atualiza se for o veículo selecionado e a view estiver visível
    }

    if (!velocidadeProgress || !statusVeiculoSpan || !velocidadeTexto || !informacoesVeiculoDiv) {
        console.error("Elementos da UI para status visual não encontrados.");
        return;
    }

    try {
        // Barra de Velocidade
        const velMax = veiculo.velocidadeMaxima > 0 ? veiculo.velocidadeMaxima : 1;
        const porcentagemVelocidade = Math.min(100, Math.max(0, (veiculo.velocidade / velMax) * 100));
        velocidadeProgress.style.width = `${porcentagemVelocidade}%`;
        velocidadeTexto.textContent = `${Math.round(veiculo.velocidade)} km/h`;

        // Status Ligado/Desligado
        statusVeiculoSpan.textContent = veiculo.ligado ? "Ligado" : "Desligado";
        statusVeiculoSpan.className = veiculo.ligado ? "status-ligado" : "status-desligado";

        // Re-renderiza informações textuais caso algo tenha mudado (carga, turbo, vel max)
        informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoesDetalhes();

        // Habilita/Desabilita botões com base no estado atual
        controlarBotoesAcaoEstado(veiculo);

    } catch (error) {
         console.error("Erro ao atualizar status visual:", error);
         // Evitar mostrar status global para erros internos frequentes aqui
    }
}

/**
 * Controla a VISIBILIDADE dos botões específicos (Turbo, Carga) baseado no TIPO.
 */
function controlarBotoesAcaoVisibilidade() {
    if (!veiculoSelecionado) return;
    const ehEsportivo = veiculoSelecionado instanceof CarroEsportivo;
    const ehCaminhao = veiculoSelecionado instanceof Caminhao;

    btnTurboOn.classList.toggle('hidden', !ehEsportivo);
    btnTurboOff.classList.toggle('hidden', !ehEsportivo);
    btnCarregar.classList.toggle('hidden', !ehCaminhao);
    btnDescarregar.classList.toggle('hidden', !ehCaminhao);
}

/**
 * Controla o ESTADO (habilitado/desabilitado) dos botões baseado no ESTADO do veículo.
 */
function controlarBotoesAcaoEstado(veiculo) {
    if (!veiculo || !btnLigar) return; // Verifica se os elementos existem

    const ligado = veiculo.ligado;
    const parado = veiculo.velocidade === 0;

    btnLigar.disabled = ligado;
    btnDesligar.disabled = !ligado || !parado;
    btnAcelerar.disabled = !ligado;
    btnFrear.disabled = !ligado && parado; // Só desabilita se desligado E parado
    btnBuzinar.disabled = false; // Permitir sempre

    if (veiculo instanceof CarroEsportivo) {
        btnTurboOn.disabled = !ligado || veiculo.turboAtivado;
        btnTurboOff.disabled = !ligado || !veiculo.turboAtivado;
    }
    if (veiculo instanceof Caminhao) {
        // Habilita carregar/descarregar APENAS se desligado
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
    let saveNeeded = false; // Flag para salvar apenas se o estado mudar
    let updateVisualNeeded = true; // Quase sempre precisa atualizar visual
    let statusMsg = { text: '', type: 'info' }; // Para mensagens de sucesso/erro

    try {
        switch (acao) {
            case "ligar":
                veiculoSelecionado.ligar(); // Lança erro se falhar
                playSound("somLigar");
                statusMsg = { text: `${veiculoSelecionado.modelo} ligado.`, type: 'success' };
                saveNeeded = true;
                break;
            case "desligar":
                veiculoSelecionado.desligar(); // Lança erro se falhar
                playSound("somDesligar");
                statusMsg = { text: `${veiculoSelecionado.modelo} desligado.`, type: 'success' };
                saveNeeded = true;
                break;
            case "acelerar":
                const velAposAcelerar = veiculoSelecionado.acelerar(15); // Lança erro se desligado
                if (velAposAcelerar > 0) playSound("somAcelerar");
                // Não salva a cada acelerada, não mostra status global
                updateVisualNeeded = true; // Só atualizar visual
                break;
            case "frear":
                const velAposFrear = veiculoSelecionado.frear(20);
                if (velAposFrear < veiculoSelecionado.velocidade) playSound("somFrear"); // Toca só se freou de fato
                if (velAposFrear === 0) {
                    statusMsg = { text: `${veiculoSelecionado.modelo} parado.`, type: 'success' };
                    saveNeeded = true; // Salva quando para
                }
                updateVisualNeeded = true;
                break;
            case "buzinar":
                veiculoSelecionado.buzinar();
                playSound("somBuzina");
                statusMsg = { text: `${veiculoSelecionado.modelo} buzinou!`, type: 'success' };
                updateVisualNeeded = false; // Buzinar não muda estado visual principal
                break;
            case "ativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) {
                    veiculoSelecionado.ativarTurbo(); // Lança erro
                    statusMsg = { text: "Turbo Ativado!", type: 'success' };
                    saveNeeded = true;
                } else {
                    throw new Error("Este veículo não possui turbo.");
                }
                break;
            case "desativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) {
                    const result = veiculoSelecionado.desativarTurbo(); // Lança erro
                    statusMsg = { text: result.message, type: 'success' };
                    saveNeeded = true;
                } else {
                    throw new Error("Este veículo não possui turbo.");
                }
                break;
            case "carregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                      // A classe já verifica se está ligado e lança erro
                      const cargaStr = prompt(`Quanto carregar? (Capacidade: ${veiculoSelecionado.capacidadeCarga}kg, Atual: ${veiculoSelecionado.cargaAtual}kg, Restante: ${veiculoSelecionado.capacidadeCarga - veiculoSelecionado.cargaAtual}kg)`);
                      if (cargaStr !== null) {
                           const carga = parseFloat(cargaStr);
                           // A classe valida quantidade > 0 e capacidade
                           const result = veiculoSelecionado.carregar(carga); // Lança erro ou retorna {success, message}
                           statusMsg = { text: result.message, type: 'success' };
                           saveNeeded = true;
                      } else { updateVisualNeeded = false; } // Cancelou prompt
                 } else { throw new Error("Este veículo não pode ser carregado."); }
                 break;
            case "descarregar":
                 if (veiculoSelecionado instanceof Caminhao) {
                      const descargaStr = prompt(`Quanto descarregar? (Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                      if (descargaStr !== null) {
                          const descarga = parseFloat(descargaStr);
                          const result = veiculoSelecionado.descarregar(descarga); // Lança erro ou retorna {success, message}
                          statusMsg = { text: result.message, type: 'success' };
                          saveNeeded = true;
                      } else { updateVisualNeeded = false; } // Cancelou prompt
                 } else { throw new Error("Este veículo não pode ser descarregado."); }
                 break;
            default:
                console.warn("Ação de interação desconhecida:", acao);
                statusMsg = { text: `Ação "${acao}" não reconhecida.`, type: 'error' };
                updateVisualNeeded = false;
        }

        // Mostrar status apenas se houver mensagem
        if (statusMsg.text) {
             mostrarStatusGlobal(statusMsg.text, statusMsg.type);
        }

    } catch (error) {
        // Captura erros lançados pelos métodos das classes
        console.error(`Erro ao executar ação '${acao}' no veículo ${veiculoSelecionado.modelo}:`, error);
        mostrarStatusGlobal(error.message || "Erro inesperado durante a ação.", "error");
        updateVisualNeeded = true; // Garante atualização visual mesmo em erro (ex: botão desligar pode habilitar)
    } finally {
         // Atualiza UI e salva se necessário (mesmo após erro, para refletir estado dos botões)
         if (updateVisualNeeded && veiculoSelecionado) {
             atualizarStatusVisual(veiculoSelecionado); // Atualiza velocímetro, status, botões
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
    const tipoSelecionado = addTipoVeiculoSelect.value;
    const ehCaminhao = tipoSelecionado === 'caminhao';
    addCamposCaminhaoDiv.classList.toggle('hidden', !ehCaminhao);
    addCapacidadeInput.required = ehCaminhao;
    if (!ehCaminhao) {
        addCapacidadeInput.value = ''; // Limpa se não for caminhão
    }
}

/**
 * Cria um novo veículo a partir do formulário.
 */
function criarVeiculoUnificado(event) {
    event.preventDefault();
    statusAdicionarP.textContent = '';
    statusAdicionarP.className = ''; // Reset class

    const tipo = addTipoVeiculoSelect.value;
    const modelo = addModeloInput.value.trim();
    const cor = addCorInput.value.trim();
    const id = uuidv4(); // Gera ID único aqui

    let novoVeiculo = null;
    let capacidade = null; // Apenas para caminhão

    try {
        // Validações comuns
        if (!modelo) {
             addModeloInput.focus();
             throw new Error("Modelo é obrigatório.");
         }
         if (!cor) {
              addCorInput.focus();
              throw new Error("Cor é obrigatória.");
          }

        // Validações e criação específicas do tipo
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
                     addCapacidadeInput.focus();
                     throw new Error("Capacidade de carga inválida (deve ser número positivo).");
                 }
                // O construtor do Caminhao já valida a capacidade internamente também
                novoVeiculo = new Caminhao(modelo, cor, capacidade, id);
                break;
            default:
                throw new Error("Tipo de veículo inválido selecionado.");
        }

        // Adiciona à garagem e salva
        garagem.push(novoVeiculo);
        salvarGaragem();
        atualizarListaVeiculosUI(); // Atualiza a lista na view da garagem

        console.log(`${novoVeiculo.tipo.charAt(0).toUpperCase() + novoVeiculo.tipo.slice(1)} ${novoVeiculo.modelo} criado.`);
        statusAdicionarP.textContent = `${novoVeiculo.tipo.charAt(0).toUpperCase() + novoVeiculo.tipo.slice(1)} "${modelo}" adicionado com sucesso!`;
        statusAdicionarP.classList.add('success'); // Adiciona classe para estilização
        mostrarStatusGlobal(`${novoVeiculo.tipo} ${modelo} adicionado!`, 'success');

        formAdicionarVeiculo.reset(); // Limpa o form
        toggleCamposCaminhao(); // Garante que campos extras sejam resetados/ocultados

        // Opcional: Redirecionar para a garagem após um delay
        setTimeout(() => {
             // Só redireciona se ainda estiver na view de adicionar
             if (!viewAdicionar.classList.contains('hidden')) {
                 switchView('garagem');
             }
         }, 1500);

    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        statusAdicionarP.textContent = `Erro: ${error.message}`;
        statusAdicionarP.classList.add('error'); // Adiciona classe para estilização
        mostrarStatusGlobal(`Falha ao adicionar: ${error.message}`, 'error');
    }
}

// ===== MANUTENÇÃO E AGENDAMENTO =====

/**
 * Atualiza a exibição do histórico e agendamentos na view de detalhes.
 */
function atualizarDisplayManutencao(veiculo) {
    historicoManutencaoDiv.innerHTML = "<p>Nenhuma manutenção realizada registrada.</p>";
    agendamentosFuturosDiv.innerHTML = "<p>Nenhum agendamento futuro.</p>";

    if (!veiculo) return;

    try {
        // Passa a função parsePtBrDate para getHistoricoFormatado poder usá-la
        const { realizadas, futuras, passadas } = veiculo.getHistoricoFormatado(parsePtBrDate);

        // Exibe histórico de realizadas
        if (realizadas.length > 0) {
            historicoManutencaoDiv.innerHTML = ""; // Limpa placeholder
            realizadas.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("manutencao-item");
                // Usar textContent para segurança contra XSS se formatar() gerasse HTML inseguro
                div.textContent = item;
                historicoManutencaoDiv.appendChild(div);
            });
        }

        // Exibe agendamentos (futuros e passados)
        let hasAgendamentos = false;
        if (futuras.length > 0) {
             if (!hasAgendamentos) agendamentosFuturosDiv.innerHTML = ""; // Limpa placeholder
             hasAgendamentos = true;
             futuras.forEach(item => {
                 const div = document.createElement("div");
                 div.classList.add("agendamento-item", "futuro");
                 div.textContent = item;
                 agendamentosFuturosDiv.appendChild(div);
             });
         }

         if (passadas.length > 0) {
             if (!hasAgendamentos) agendamentosFuturosDiv.innerHTML = ""; // Limpa placeholder
             hasAgendamentos = true;

             // Adiciona um separador ou título se houver futuros
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
              passadasTitle.style.color = '#6c757d'; // Cinza
              agendamentosFuturosDiv.appendChild(passadasTitle);


             passadas.forEach(item => {
                 const div = document.createElement("div");
                 div.classList.add("agendamento-item", "passado"); // Classe para estilizar (ex: cor diferente)
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
    event.preventDefault();
    if (!veiculoSelecionado) {
        mostrarStatusGlobal("Selecione um veículo.", "error");
        return;
    }

    const data = dataAgendamentoInput.value;
    const tipo = tipoAgendamentoInput.value.trim();
    const custoStr = custoAgendamentoInput.value;
    const descricao = descricaoAgendamentoInput.value.trim();
    let custo = null;

    // Validação de Custo: obrigatório e >= 0 APENAS para 'Realizada'
    if (status === 'Realizada') {
        custo = parseFloat(custoStr);
        if (custoStr === '' || isNaN(custo) || custo < 0) {
            mostrarStatusGlobal("Custo é obrigatório e deve ser positivo (ou zero) para manutenção realizada.", "error");
            custoAgendamentoInput.focus();
            return;
        }
    } else { // Para 'Agendada', custo é opcional
        custo = (custoStr && !isNaN(parseFloat(custoStr)) && parseFloat(custoStr) >= 0)
                ? parseFloat(custoStr)
                : null;
    }

    // Cria instância de Manutencao
    const novaManutencao = new Manutencao(data, tipo, custo, descricao, status);

    // Valida usando o método da classe Manutencao
    const validacao = novaManutencao.validar();
    if (!validacao.isValid) {
        mostrarStatusGlobal(validacao.message, "error");
        // Tentar focar no campo problemático (melhoria futura)
        if (validacao.message.includes("tipo")) tipoAgendamentoInput.focus();
        else if (validacao.message.includes("data")) dataAgendamentoInput.focus();
        else if (validacao.message.includes("Custo")) custoAgendamentoInput.focus();
        return;
    }

    // Adiciona ao histórico do veículo (o método adicionarManutencao não valida mais)
    if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
         salvarGaragem(); // Salva o estado da garagem
         atualizarDisplayManutencao(veiculoSelecionado); // Atualiza a UI
         formularioAgendamento.reset(); // Limpa o formulário

         const dataFormatada = parsePtBrDate(data)
            ? parsePtBrDate(data).toLocaleDateString('pt-BR', { timeZone: 'UTC'})
            : data; // Fallback se parse falhar
         const acao = status === 'Agendada' ? 'agendada' : 'registrada como realizada';
         mostrarStatusGlobal(`Manutenção "${tipo}" ${acao} para ${dataFormatada}!`, "success");

         if (status === 'Agendada') {
             verificarAgendamentosProximos(); // Re-verifica alertas se foi agendamento
         }
    } else {
         // Erro interno no adicionarManutencao (já logado no console pela classe)
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
                const dataAgendamento = manutencao.getDataObj(); // Já é UTC
                if (dataAgendamento) {
                    dataAgendamento.setUTCHours(0,0,0,0); // Garante comparação só de data

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
        // Usando status global para ser menos disruptivo
        mostrarStatusGlobal(`Lembretes: ${todosAlertas.join(' | ')}`, 'info', 10000); // Duração maior
    }
}


// ===== INICIALIZAÇÃO E EVENT LISTENERS GLOBAIS =====

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM carregado. Iniciando Garagem Inteligente...");

    // --- Listeners de Navegação ---
    navGaragemLink.addEventListener('click', (e) => { e.preventDefault(); switchView('garagem'); });
    navAdicionarLink.addEventListener('click', (e) => { e.preventDefault(); switchView('adicionar'); });
    btnVoltarGaragem.addEventListener('click', () => switchView('garagem'));

    // --- Listeners do Formulário Adicionar ---
    addTipoVeiculoSelect.addEventListener('change', toggleCamposCaminhao);
    formAdicionarVeiculo.addEventListener('submit', criarVeiculoUnificado);

    // --- Listeners do Formulário de Manutenção ---
    // Usar IDs nos botões para selecioná-los de forma mais robusta
    const btnSubmitAgendar = document.getElementById('btnSubmitAgendar');
    const btnSubmitRealizada = document.getElementById('btnSubmitRealizada');

    if (btnSubmitAgendar) {
        btnSubmitAgendar.addEventListener('click', (e) => adicionarManutencaoForm(e, 'Agendada'));
    }
    if (btnSubmitRealizada) {
        btnSubmitRealizada.addEventListener('click', (e) => adicionarManutencaoForm(e, 'Realizada'));
    }
     // Prevenir submit duplo se Enter for pressionado em algum campo do form de manutenção
     formularioAgendamento.addEventListener('submit', (e) => e.preventDefault());

    // --- Carregar Dados e Iniciar ---
    carregarGaragem(); // Carrega do localStorage e atualiza UI inicial
    switchView('garagem'); // Define a view inicial

    console.log("Garagem Inteligente inicializada.");
    mostrarStatusGlobal("Sistema pronto.", "success", 2000);
});

// Opcional: Salvar antes de fechar (melhor salvar após cada mudança significativa)
// window.addEventListener('beforeunload', salvarGaragem);

// Disponibilizar `interagir` globalmente se os botões usam onclick="interagir(...)"
// É melhor adicionar event listeners diretamente aos botões, mas se precisar do onclick:
window.interagir = interagir;