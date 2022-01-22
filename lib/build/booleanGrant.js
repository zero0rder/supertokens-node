"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BooleanGrant {
    constructor(name, checkUser) {
        this.checkUser = checkUser;
        this.checkers = {
            createdWithin(milliSeconds) {
                return (payload) =>
                    payload[this.key] !== undefined && new Date().getTime() < payload[this.key] + milliSeconds;
            },
        };
        this.key = `st-grant-${name}`;
    }
    addToAccessTokenPayload(origPayload, value) {
        return Object.assign(Object.assign({}, origPayload), {
            [this.key]: {
                t: new Date().getTime(),
                v: value,
            },
        });
    }
    removeFromAccessTokenPayload(origPayload) {
        const res = Object.assign({}, origPayload);
        delete res[this.key];
        return res;
    }
    checkAccessTokenPayload(payload) {
        return payload[this.key] !== undefined && payload[this.key].v === true;
    }
}
exports.BooleanGrant = BooleanGrant;
