class Consulta {
    constructor({data, hora, status}) {
        this.data = data;
        this.hora = hora;
        this.status = status;
    }

    get Data() { return this.data }
    set Data(value) { this.data = value }

    get Hora() { return this.hora }
    set Hora(value) { this.hora = value }

    get Status() { return this.status }
    set Status(value) { this.status = value }
}

module.exports = Consulta;