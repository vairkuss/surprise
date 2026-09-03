class DH {
    static #cursor = {};
    static #active = 0;
    static get active() {
        return this.#active;
    }
    
    static message(replica) {
        alert
    }
    
    static async dialogue(character) {
        this.#active = 1;
        const { before, replicas, choice } = await fetch(`http://localhost:7148/get/replicas?c=${character}&t=${this.cursor.get(character)}`);
        replicas.slice(0, replicas.length - 1).forEach(replica => this.message(replica));
        replicas[replicas.length - 1]
        this.#active = 0;
    }
}