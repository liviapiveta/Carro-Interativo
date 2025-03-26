class Carro {
  constructor(modelo, cor) {
      this.modelo = modelo;
      this.cor = cor;
      this.ligado = false;
      this.velocidade = 0;
      this.velocidadeMaxima = 180; // Velocidade máxima padrão
      this.tipo = "carro"; // Adicionado o tipo
  }

  ligar() {
      if (this.ligado) {
          alert("O carro já está ligado!");
          return;
      }
      this.ligado = true;
      playSound("somLigar");
      atualizarStatusVisual(this);
      console.log("Carro ligado!");
  }

  desligar() {
      if (!this.ligado) {
          alert("O carro já está desligado!");
          return;
      }
      this.ligado = false;
      this.velocidade = 0;
      playSound("somDesligar");
      atualizarStatusVisual(this);
      console.log("Carro desligado!");
  }

  acelerar(incremento) {
      if (!this.ligado) {
          alert("O carro precisa estar ligado para acelerar.");
          return;
      }
      if (this.velocidade + incremento > this.velocidadeMaxima) {
          this.velocidade = this.velocidadeMaxima;
          alert("Velocidade máxima atingida!");
      } else {
          this.velocidade += incremento;
      }
      playSound("somAcelerar");
      atualizarStatusVisual(this);
      console.log(`Velocidade aumentada para ${this.velocidade}`);
  }

  frear(decremento) {
      if (this.velocidade === 0) {
          alert("O carro já está parado.");
          return;
      }
      this.velocidade = Math.max(0, this.velocidade - decremento); // Garante que a velocidade não seja negativa
      playSound("somFrear");
      atualizarStatusVisual(this);
      console.log(`Velocidade reduzida para ${this.velocidade}`);
  }


  buzinar() {
      playSound("somBuzina");
      console.log("Beep beep!");
  }

  exibirInformacoes() {
      const status = this.ligado ? `<span class="status-ligado">Ligado</span>` : `<span class="status-desligado">Desligado</span>`;
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
      super(modelo, cor);
      this.turboAtivado = false;
      this.velocidadeMaxima = 250; // Velocidade máxima maior para carros esportivos
      this.tipo = "esportivo"; // Adicionado o tipo
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
      this.acelerar(50); // Aumenta a velocidade com turbo
      console.log("Turbo ativado!");
      atualizarStatusVisual(this);
  }

  desativarTurbo() {
      if (!this.turboAtivado) {
          alert("O turbo já está desativado!");
          return;
      }
      this.turboAtivado = false;
      console.log("Turbo desativado!");
      atualizarStatusVisual(this);
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
      this.velocidadeMaxima = 120; // Velocidade máxima menor para caminhões
      this.tipo = "caminhao"; // Adicionado o tipo
  }

  carregar(quantidade) {
      if (quantidade <= 0) {
          alert("A quantidade a carregar deve ser maior que zero.");
          return;
      }
      if (this.cargaAtual + quantidade > this.capacidadeCarga) {
          alert("Carga excede a capacidade do caminhão.");
          return;
      }
      this.cargaAtual += quantidade;
      console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual}`);
      atualizarStatusVisual(this);
  }

  descarregar(quantidade) {
      if (quantidade <= 0) {
          alert("A quantidade a descarregar deve ser maior que zero.");
          return;
      }
      if (this.cargaAtual - quantidade < 0) {
          alert("Não há carga suficiente para descarregar.");
          return;
      }
      this.cargaAtual -= quantidade;
      console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual}`);
      atualizarStatusVisual(this);
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
  if (!veiculo) {
      alert("Nenhum veículo selecionado!");
      return;
  }

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
              alert("Este veículo não tem turbo.");
          }
          break;
      case "desativarTurbo":
          if (veiculo instanceof CarroEsportivo) {
              veiculo.desativarTurbo();
          } else {
              alert("Este veículo não tem turbo.");
          }
          break;
      case "carregar":
          const carga = parseInt(prompt("Quanto carregar?"));
          if (veiculo instanceof Caminhao) {
              veiculo.carregar(carga);
          } else {
              alert("Este veículo não pode ser carregado.");
          }
          break;
      case "descarregar":
          const descarga = parseInt(prompt("Quanto descarregar?"));
          if (veiculo instanceof Caminhao) {
              veiculo.descarregar(descarga);
          } else {
              alert("Este veículo não pode ser descarregado.");
          }
          break;
      default:
          alert("Ação inválida.");
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
  const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
  const imagemVeiculo = document.getElementById("imagemVeiculo");

  if (veiculo) {
      informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoes();
      imagemVeiculo.style.display = "block";

      let imagePath = "";
      switch (veiculo.tipo) {
          case "carro":
              imagePath = "imagens/carro.png";
              break;
          case "esportivo":
              imagePath = "imagens/esportivo.png";
              break;
          case "caminhao":
              imagePath = "imagens/caminhao.png";
              break;
          default:
              imagePath = "";
              imagemVeiculo.style.display = "none";
              break;
      }

      imagemVeiculo.src = imagePath;
      imagemVeiculo.alt = veiculo.tipo;

      atualizarStatusVisual(veiculo); // Atualiza o status visual
  } else {
      informacoesVeiculoDiv.innerHTML = "Nenhum veículo selecionado.";
      imagemVeiculo.style.display = "none";
  }
}

// Função para atualizar a barra de progresso e o status do veículo
function atualizarStatusVisual(veiculo) {
  const velocidadeProgress = document.getElementById("velocidadeProgress");
  const statusVeiculo = document.getElementById("statusVeiculo");
  const velocidadeTexto = document.getElementById("velocidadeTexto"); // Nova linha

  // Calcula a porcentagem da velocidade atual em relação à velocidade máxima
  const porcentagemVelocidade = (veiculo.velocidade / veiculo.velocidadeMaxima) * 100;
  velocidadeProgress.style.width = porcentagemVelocidade + "%";

  // Atualiza o texto da velocidade
  velocidadeTexto.textContent = `${veiculo.velocidade} km/h`;

  // Atualiza o status do veículo (Ligado/Desligado)
  if (veiculo.ligado) {
      statusVeiculo.textContent = "Ligado";
      statusVeiculo.className = "status-ligado"; // Define a classe para a cor verde
  } else {
      statusVeiculo.textContent = "Desligado";
      statusVeiculo.className = "status-desligado"; // Define a classe para a cor vermelha
  }
}

// Função para reproduzir os sons
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  sound.currentTime = 0; // Reinicia o som para tocar novamente
  sound.play();
}

// Adicionar event listeners aos botões de seleção de veículo
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btnCarro").addEventListener("click", function () {
      exibirInformacoes(carroBase);
      veiculoSelecionado = carroBase; // Atualiza o veículo selecionado
  });

  document.getElementById("btnEsportivo").addEventListener("click", function () {
      exibirInformacoes(carroEsportivo);
      veiculoSelecionado = carroEsportivo; // Atualiza o veículo selecionado
  });

  document.getElementById("btnCaminhao").addEventListener("click", function () {
      exibirInformacoes(caminhao);
      veiculoSelecionado = caminhao; // Atualiza o veículo selecionado
  });
});

// Variável para controlar qual veículo está selecionado
let veiculoSelecionado = null;