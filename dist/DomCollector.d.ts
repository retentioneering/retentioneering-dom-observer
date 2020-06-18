/**
 * By Alexey Avramenko and Retentioneering Team
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions.
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
import { DomObserver, MainObserverCb } from "./DomObserver";
import { ParserConfig } from "./DomParser";
export declare type DomCollectorTarget = {
    name: string;
    targetSelector: string;
    guardSelector?: string;
    parseRootEl: string | HTMLElement;
    observeConfig?: MutationObserverInit;
    parseConfig: ParserConfig;
};
declare type DomCollectorResult = {
    name: string;
    parsedContent: any;
};
declare type Params = {
    targets: DomCollectorTarget[];
    onCollect: (result: DomCollectorResult) => void;
    rootEl?: HTMLElement;
    mainObserverCallback?: MainObserverCb;
};
export declare const createDomCollector: ({ targets, onCollect, rootEl, mainObserverCallback, }: Params) => DomObserver;
export {};
