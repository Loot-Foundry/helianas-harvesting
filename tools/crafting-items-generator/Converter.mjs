export class Converter {
    #fields = [];

    #uniqueIds = new Set();

    constructor(fields) {
        this.#fields = fields;
    }

    convertLine(input) {
        const result = {};
        for(let field of this.#fields) {
            if (typeof input[field.in] === "undefined") throw new Error(`Missing Field: '${field.in}'`);
            result[field.out] = this.#selectMethod(field.type, input[field.in]);
        }
        return result;
    }

    #selectMethod(method, input) {
        if (typeof (input) === "undefined") 
            throw new Error("Missing Input");

        if (method === "uuid") {
            return this.#methodUniqueId(input);
        }
        else if (method === "string") {
            return this.#requiredString(input);
        }
        else if (method === "int") {
            return this.#methodInt(input);
        }
        else if (method === "bool") {
            return this.#methodBool(input);
        }
        else if (method === "list") {
            return this.#methodStringList(input);
        }
        else {
            throw new Error("Unknown Method: " + method);
        }
    }

    #requiredString(input) {
        if (typeof input === "string") {
            input = input.trim()
            if (input) return input;
        }

        throw new Error("Missing input");
    }

    #methodUniqueId(input) {
        input = input.trim();
        if (!(/^[a-zA-Z0-9]{16}$/.test(input))) throw new Error("Invalid Unique Id: '" + input + "'");

        if (this.#uniqueIds.has(input)) throw new Error("Duplicate Ids");
        else this.#uniqueIds.add(input);

        return input;
    }

    #methodBool(input) {
        if (input === 'TRUE') return true;
        if (input === 'FALSE') return false;

        assert("Expected input wasn't 'TRUE' or 'FALSE'");
    }

    #methodInt(input) {
        const value = parseInt(input);
        if (!Number.isInteger(value)) throw new Error('Expected input wasn\'t an Integer');
        return value;
    }

    #methodStringList(input) {
        return input ? input.split(/[,;]/g).map(b => b.trim()) : [];
    }
}