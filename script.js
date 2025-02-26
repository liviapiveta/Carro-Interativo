// Definição da Classe Carro
class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0;  // Novo atributo: velocidade
        this.ligado = false;
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            console.log("Carro ligado!");
        } else {
            console.log("O carro já está ligado.");
        }
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            console.log("Carro desligado!");
        } else {
            console.log("O carro já está desligado.");
        }
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            console.log(`Acelerando. Velocidade atual: ${this.velocidade} km/h`);
            this.atualizarVelocidadeNaTela(); // Atualiza a exibição na tela
        } else {
            console.log("O carro precisa estar ligado para acelerar.");
        }
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-valor").textContent = this.velocidade;
    }
}

// Criação de um Objeto Carro
const meuCarro = new Carro("Sedan", "Prata");

// Atualiza as informações do carro na tela
document.getElementById("carro-modelo").textContent = "Modelo: " + meuCarro.modelo;
document.getElementById("carro-cor").textContent = "Cor: " + meuCarro.cor;

// Elementos do DOM
const botaoLigarDesligar = document.getElementById("ligar-desligar");
const botaoAcelerar = document.getElementById("acelerar");

// Event Listeners (Ações dos Botões)
botaoLigarDesligar.addEventListener("click", function() {
    if (meuCarro.ligado) {
        meuCarro.desligar();
        botaoLigarDesligar.textContent = "Ligar";
    } else {
        meuCarro.ligar();
        botaoLigarDesligar.textContent = "Desligar";
    }
});

botaoAcelerar.addEventListener("click", function() {
    meuCarro.acelerar(10); // Acelera em 10 km/h
});