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
      
        exibirStatus() {
          return `${super.exibirStatus()}, Carga: ${this.cargaAtual}/${this.capacidadeCarga}`;
        }
      }

      // Variáveis para armazenar os objetos
let carroEsportivo;
let caminhao;

// Funções para criar os objetos
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

// Funções para interagir com o carro esportivo
function ligarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.ligar();
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function desligarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.desligar();
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function acelerarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.acelerar(10);
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function frearEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.frear(10);
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function ativarTurbo() {
  if (carroEsportivo) {
    carroEsportivo.ativarTurbo();
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

function desativarTurbo() {
  if (carroEsportivo) {
    carroEsportivo.desativarTurbo();
    atualizarStatusEsportivo();
  } else {
    alert("Crie o carro esportivo primeiro!");
  }
}

// Funções para interagir com o caminhão
function ligarCaminhao() {
  if (caminhao) {
    caminhao.ligar();
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function desligarCaminhao() {
  if (caminhao) {
    caminhao.desligar();
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function acelerarCaminhao() {
  if (caminhao) {
    caminhao.acelerar(5);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function frearCaminhao() {
  if (caminhao) {
    caminhao.frear(5);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function carregarCaminhao() {
  if (caminhao) {
    const carga = parseInt(document.getElementById("carga").value);
    caminhao.carregar(carga);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

function descarregarCaminhao() {
  if (caminhao) {
    const carga = parseInt(document.getElementById("carga").value);
    caminhao.descarregar(carga);
    atualizarStatusCaminhao();
  } else {
    alert("Crie o caminhão primeiro!");
  }
}

// Funções para exibir o status
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
    