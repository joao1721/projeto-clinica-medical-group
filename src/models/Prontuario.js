class Prontuario {
    constructor({diagnostico, medicacao}) {
        this.diagnostico = diagnostico;
        this.medicacao = medicacao;
    }

    get Diagnostico() { return this.diagnostico }
    set Diagnostico(value) { this.diagnostico = value }

    get Medicacao() { return this.medicacao }
    set Medicacao(value) { this.medicacao = value }
}