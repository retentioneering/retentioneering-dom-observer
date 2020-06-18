/**
 * By Alexey Avramenko and Retentioneering Team
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions.
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
declare type EventHadler<P = any> = (p: P) => any;
export declare class EventEmitter {
    private events;
    private createUnwatcher;
    on<P = any>(eventName: string, handler: EventHadler<P>): () => void;
    off<P = any>(eventName: string, handler: EventHadler<P>): void;
    dispatch<P = any>(eventName: string, payload?: P): void;
}
export {};
