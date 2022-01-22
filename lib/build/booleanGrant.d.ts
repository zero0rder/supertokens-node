// @ts-nocheck
import { Grant } from "./types";
export declare class BooleanGrant implements Grant {
    readonly checkUser: (userId: string) => boolean | Promise<boolean>;
    readonly key: string;
    constructor(name: string, checkUser: (userId: string) => boolean | Promise<boolean>);
    addToAccessTokenPayload(origPayload: any, value: boolean): any;
    removeFromAccessTokenPayload(origPayload: any): any;
    checkAccessTokenPayload(payload: any): boolean | Promise<boolean>;
    checkers: {
        createdWithin(milliSeconds: number): (payload: any) => boolean;
    };
}
