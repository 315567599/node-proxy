import logger from './logger';

const DEFAULT_CACHE_TTL = 60 * 60 * 2 * 1000; //2 hour

function debug() {
    logger.info.apply(logger, ['memoryCache', ...arguments]);
}

 class memoryCache {
    constructor() {
        this.ttl = DEFAULT_CACHE_TTL;
        this.cache = Object.create(null);
    }

    get(key) {
        debug('->get', key);
        const record = this.cache[key];
        if (record == null) {
            return null;
        }

        if (isNaN(record.expire) || record.expire >= Date.now()) {
            return record.value;
        }

        delete this.cache[key];
        return null;
    }

    put(key, value, ttl = this.ttl) {
        debug('->put', key, value, ttl);
        if (ttl < 0 || isNaN(ttl)) {
            ttl = NaN;
        }

        var record = {
            value: value,
            expire: ttl + Date.now()
        }

        if (!isNaN(record.expire)) {
            record.timeout = setTimeout(() => {
                this.del(key);
            }, ttl);
        }

        this.cache[key] = record;
    }

    del(key) {
        var record = this.cache[key];
        if (record == null) {
            return;
        }

        if (record.timeout) {
            clearTimeout(record.timeout);
        }
        delete this.cache[key];
    }

    clear() {
        this.cache = Object.create(null);
    }

    all() {
        return this.cache;
    }

}

const cache = new memoryCache();
export {cache};
