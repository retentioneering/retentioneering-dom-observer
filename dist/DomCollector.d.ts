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
