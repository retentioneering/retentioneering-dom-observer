/**
 * By Alexey Avramenko and Retentioneering Team
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions.
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
import { DomObserver, MainObserverCb, ObserveDomEvent } from "./DomObserver";
import { ParserConfig, ParseDomResult } from "./DomParser";
export declare type DomCollectorTarget = {
    name: string;
    targetSelector: string;
    guardSelector?: string;
    childGuardSelector?: string;
    guard?: (rootElement: Element, parsedContent: ParseDomResult) => boolean;
    parseRootEl?: string | Element;
    observeConfig?: MutationObserverInit;
    parseConfig: ParserConfig;
    payload?: any;
    mapResult?: (parsedContent: any) => any;
};
declare type DomCollectorResult = {
    name: string;
    payload?: any;
    originalEvent?: ObserveDomEvent;
    parsedContent: any;
};
declare type Params = {
    targets: DomCollectorTarget[];
    onCollect: (result: DomCollectorResult) => void;
    rootEl?: Element;
    mainObserverCallback?: MainObserverCb;
};
export declare const createDomCollector: ({ targets, onCollect, rootEl, mainObserverCallback, }: Params) => DomObserver;
export {};
