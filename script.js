class Carro {
  constructor(modelo, cor) {
    this.modelo = modelo;
    this.cor = cor;
    this.ligado = false;
    this.velocidade = 0;
  }

  ligar() {
    this.ligado = true;
    console.log("Carro ligado!");
  }

  desligar() {
    this.ligado = false;
    this.velocidade = 0;
    console.log("Carro desligado!");
  }

  acelerar(incremento) {
    if (this.ligado) {
      this.velocidade += incremento;
      console.log(`Velocidade aumentada para ${this.velocidade}`);
    } else {
      console.log("O carro precisa estar ligado para acelerar.");
    }
  }

  frear(decremento) {
    if (this.velocidade > 0) {
      this.velocidade -= decremento;
      console.log(`Velocidade reduzida para ${this.velocidade}`);
    } else {
      console.log("O carro já está parado.");
    }
  }

  buzinar() {
    console.log("Beep beep!");
  }

  exibirInformacoes() {
    const status = this.ligado ? "Ligado" : "Desligado";
    return `
      Modelo: ${this.modelo}<br>
      Cor: ${this.cor}<br>
      Status: ${status}<br>
      Velocidade: ${this.velocidade} km/h`;
  }

  exibirStatus() {
    return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado}, Velocidade: ${this.velocidade}`;
  }
}

class CarroEsportivo extends Carro {
  constructor(modelo, cor) {
    super(modelo, cor); // Chama o construtor da classe Carro
    this.turboAtivado = false;
  }

  ativarTurbo() {
    if (this.ligado) {
      this.turboAtivado = true;
      this.acelerar(50); // Aumenta a velocidade com turbo
      console.log("Turbo ativado!");
    } else {
      console.log("O carro precisa estar ligado para ativar o turbo.");
    }
  }

  desativarTurbo() {
    this.turboAtivado = false;
    console.log("Turbo desativado!");
  }

  exibirInformacoes() {
    const infoBase = super.exibirInformacoes();
    const turboStatus = this.turboAtivado ? "Ativado" : "Desativado";
    return `
      ${infoBase}<br>
      Turbo: ${turboStatus}
    `;
  }

  exibirStatus() {
    return `${super.exibirStatus()}, Turbo: ${this.turboAtivado}`;
  }
}

class Caminhao extends Carro {
  constructor(modelo, cor, capacidadeCarga) {
    super(modelo, cor);
    this.capacidadeCarga = capacidadeCarga;
    this.cargaAtual = 0;
  }

  carregar(quantidade) {
    if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
      this.cargaAtual += quantidade;
      console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual}`);
    } else {
      console.log("Carga excede a capacidade do caminhão.");
    }
  }

  descarregar(quantidade) {
    if (this.cargaAtual - quantidade >= 0) {
      this.cargaAtual -= quantidade;
      console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual}`);
    } else {
      console.log("Não há carga suficiente para descarregar.");
    }
  }

  exibirInformacoes() {
    const infoBase = super.exibirInformacoes();
    return `
      ${infoBase}<br>
      Capacidade de carga: ${this.capacidadeCarga} kg<br>
      Carga atual: ${this.cargaAtual} kg`;
  }

  exibirStatus() {
    return `${super.exibirStatus()}, Carga: ${this.cargaAtual}/${this.capacidadeCarga}`;
  }
}

// Variáveis para armazenar os objetos
let carroBase;
let carroEsportivo;
let caminhao;

// Funções para criar os objetos
function criarCarroBase() {
  const modelo = document.getElementById("modeloBase").value;
  const cor = document.getElementById("corBase").value;
  carroBase = new Carro(modelo, cor);
  atualizarStatusBase();
}

function criarCarroEsportivo() {
  const modelo = document.getElementById("modeloEsportivo").value;
  const cor = document.getElementById("corEsportivo").value;
  carroEsportivo = new CarroEsportivo(modelo, cor);
  atualizarStatusEsportivo();
}

function criarCaminhao() {
  const modelo = document.getElementById("modeloCaminhao").value;
  const cor = document.getElementById("corCaminhao").value;
  const capacidadeCaminhao = parseInt(document.getElementById("capacidadeCaminhao").value);
  caminhao = new Caminhao(modelo, cor, capacidadeCaminhao);
  atualizarStatusCaminhao();
}

// Função genérica para interagir com o veículo
function interagir(veiculo, acao) {
  switch (acao) {
    case "ligar":
      veiculo.ligar();
      break;
    case "desligar":
      veiculo.desligar();
      break;
    case "acelerar":
      veiculo.acelerar(10);
      break;
    case "frear":
      veiculo.frear(10);
      break;
    case "buzinar":
      veiculo.buzinar();
      break;
    case "ativarTurbo":
      if (veiculo instanceof CarroEsportivo) {
        veiculo.ativarTurbo();
      } else {
        console.log("Este veículo não tem turbo.");
      }
      break;
    case "desativarTurbo":
      if (veiculo instanceof CarroEsportivo) {
        veiculo.desativarTurbo();
      } else {
        console.log("Este veículo não tem turbo.");
      }
      break;
    case "carregar":
      const carga = parseInt(prompt("Quanto carregar?"));
      if (veiculo instanceof Caminhao) {
        veiculo.carregar(carga);
      } else {
        console.log("Este veículo não pode ser carregado.");
      }
      break;
    case "descarregar":
      const descarga = parseInt(prompt("Quanto descarregar?"));
      if (veiculo instanceof Caminhao) {
        veiculo.descarregar(descarga);
      } else {
        console.log("Este veículo não pode ser descarregado.");
      }
      break;
    default:
      console.log("Ação inválida.");
  }

  // Atualizar exibição das informações
  exibirInformacoes(veiculo); // A função já atualiza a interface
}

// Funções para exibir o status
function atualizarStatusBase() {
  const statusDiv = document.getElementById("statusBase");
  if (carroBase) {
    statusDiv.textContent = carroBase.exibirStatus();
  } else {
    statusDiv.textContent = "Carro base não criado.";
  }
}

function atualizarStatusEsportivo() {
  const statusDiv = document.getElementById("statusEsportivo");
  if (carroEsportivo) {
    statusDiv.textContent = carroEsportivo.exibirStatus();
  } else {
    statusDiv.textContent = "Carro esportivo não criado.";
  }
}

function atualizarStatusCaminhao() {
  const statusDiv = document.getElementById("statusCaminhao");
  if (caminhao) {
    statusDiv.textContent = caminhao.exibirStatus();
  } else {
    statusDiv.textContent = "Caminhão não criado.";
  }
}

// Função para exibir as informações do veículo no HTML
function exibirInformacoes(veiculo) {
  document.getElementById("informacoesVeiculo").innerHTML = veiculo.exibirInformacoes();
}

// Adicionar event listeners aos botões de seleção de veículo
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("btnCarro").addEventListener("click", function() {
    exibirInformacoes(carroBase);
    veiculoSelecionado = carroBase; // Atualiza o veículo selecionado
  });

  document.getElementById("btnEsportivo").addEventListener("click", function() {
    exibirInformacoes(carroEsportivo);
    veiculoSelecionado = carroEsportivo; // Atualiza o veículo selecionado
  });

  document.getElementById("btnCaminhao").addEventListener("click", function() {
    exibirInformacoes(caminhao);
    veiculoSelecionado = caminhao; // Atualiza o veículo selecionado
  });
});

// Variável para controlar qual veículo está selecionado
let veiculoSelecionado = null;