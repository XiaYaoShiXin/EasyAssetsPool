const Events = require("events");
const FileSystem = require("fs");
const EventEmitter = new Events();
const Pool = {};

class PoolNotExistError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "PoolNotExistError";
    }
}

class DuplidateElementReleaseError extends Error {
    constructor(name, element) {
        super("Pool[" + name + "]:" + element);
        this.name = "DuplidateElementReleaseError";
    }
}

class FetchElementTimeoutError extends Error {
    constructor(name) {
        super(name);
        this.name = "FetchElementTimeoutError";
    }
}

class SavePoolElementsError extends Error {
    constructor(name) {
        super(name);
        this.name = "SavePoolError";
    }
}

class LoadPoolElementsError extends Error {
    constructor(name) {
        super(name);
        this.name = "LoadPoolElementsError";
    }
}

const getEventName = (POOL_NAME) => {
    return "POOL[" + POOL_NAME + "]Released";
}

exports.fetch = (name, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        if (!Pool.hasOwnProperty(name)) throw new PoolNotExistError(name);
        if (Pool[name].elements.length != 0) {
            resolve(Pool[name].elements.shift());
        } else {
            const checker = setTimeout(() => {
                EventEmitter.removeListener(getEventName(name), listener);
                reject(new FetchElementTimeoutError(name));
            }, timeout);
            const listener = () => {
                let element = Pool[name].elements.shift();
                if (element != undefined) {
                    clearTimeout(checker);
                    let listeners = EventEmitter._events[getEventName(name)];
                    if (typeof listeners == "function") {
                        EventEmitter._events[getEventName(name)] = [];
                    } else {
                        listeners.shift();
                    }
                    resolve(element);
                }
            };
            EventEmitter.on(getEventName(name), listener);
        }
    });
}

exports.release = (name, element) => {
    return new Promise((resolve, reject) => {
        if (!Pool.hasOwnProperty(name)) reject(new PoolNotExistError(name));
        if (!Pool[name].options.unique || Pool[name].elements.includes(element)) reject(new DuplidateElementReleaseError(name, element));
        Pool[name].elements.push(element);
        console.log(EventEmitter._events);
        EventEmitter.emit(getEventName(name));
        console.log(EventEmitter._events);
        resolve();
    });
}

exports.init = (name, options = {}, elements = []) => {
    Pool[name] = {
        elements: [...elements],
        options: {
            unique: options.unique == undefined ? true : options.unique,
            isString: options.isString == undefined ? false : options.unique
        }
    };
}

exports.save = (name, path) => {
    return new Promise((resolve, reject) => {
        if (!Pool.hasOwnProperty(name)) reject(new PoolNotExistError(name));
        const text = Pool[name].elements.map((element) => {
            try {
                return JSON.stringify(element);
            } catch (err) {
                return element.toString();
            }
        }).reduce((before, next) => {
            return before + "\r\n" + next;
        });
        FileSystem.writeFile(path, text, (err) => {
            if (err) reject(new SavePoolElementsError(err));
            resolve(text);
        });
    });
}

exports.load = (name, path) => {
    return new Promise((resolve, reject) => {
        if (!Pool.hasOwnProperty(name)) reject(new PoolNotExistError(name));
        FileSystem.readFile(path, 'utf-8', (err, data) => {
            if (err) reject(err);
            Pool[name].elements = data.split("\r\n").map((text) => {
                try {
                    if (Pool[name].options.isString) return text;
                    return JSON.parse(text);
                } catch (err) {
                    return text;
                }
            });
            resolve(Pool[name].elements);
        });
    });
}

exports.log = (name = undefined) => {
    if (name == undefined) {
        console.log(JSON.stringify(Pool));
    } else if (!Pool.hasOwnProperty(name)) {
        console.log("Pool[" + name + "]:null");
    } else {
        console.log("Pool[" + name + "]:" + JSON.stringify(Pool[name]));
    }
}