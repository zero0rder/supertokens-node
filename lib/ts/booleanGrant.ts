import { Grant } from "./types";

export class BooleanGrant implements Grant {
    public readonly key: string;

    constructor(name: string, public readonly checkUser: (userId: string) => boolean | Promise<boolean>) {
        this.key = `st-grant-${name}`;
    }

    addToAccessTokenPayload(origPayload: any, value: boolean) {
        return {
            ...origPayload,
            [this.key]: {
                t: new Date().getTime(),
                v: value,
            },
        };
    }
    removeFromAccessTokenPayload(origPayload: any) {
        const res = {
            ...origPayload,
        };
        delete res[this.key];
        return res;
    }

    checkAccessTokenPayload(payload: any): boolean | Promise<boolean> {
        return payload[this.key] !== undefined && payload[this.key].v === true;
    }
    checkers = {
        createdWithin(milliSeconds: number) {
            return (payload: any) =>
                payload[this.key] !== undefined && new Date().getTime() < payload[this.key] + milliSeconds;
        },
    };
}
