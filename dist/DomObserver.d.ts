import { EventEmitter } from "./EventEmitter";
declare type TargetElementDescriptor = {
    name: string;
    selector: string;
    observerConfig?: MutationObserverInit;
};
export declare const FOUND_EVENT_NAME = "target-element-found";
export declare const MUTATED_EVENT_NAME = "target-element-mutated";
export declare type FoundEvent = {
    type: typeof FOUND_EVENT_NAME;
    descriptor: TargetElementDescriptor;
    element: HTMLElement;
};
export declare type MutatedEvent = {
    type: typeof MUTATED_EVENT_NAME;
    descriptor: TargetElementDescriptor;
    mutations: MutationRecord[];
};
export declare type ObserveDomEvent = FoundEvent | MutatedEvent;
export declare type MainObserverCb = (mutations: MutationRecord[]) => void;
declare type SubscribeCb = (e: ObserveDomEvent) => void;
export declare class DomObserver extends EventEmitter {
    private _rootElement;
    private _mainObserver;
    private _observedElements;
    private _targetElementsObservers;
    private _targetElementsDescriptors;
    private _checkTargetSelectorAndObserve;
    private _matchTargetElementMutations;
    private _observeTargetElements;
    private _onTargetElementMutated;
    private _dispatchMutatedEvent;
    private _dispatchFoundEvent;
    private _onRootElementMutated;
    private _clearObservedElementsByMutation;
    private _clearObservedElementsByDescriptor;
    constructor(_rootElement?: HTMLElement);
    get observedElements(): HTMLElement[];
    start(cb?: MainObserverCb): this;
    stop(): this;
    subscribe(cb: SubscribeCb, descriptor?: TargetElementDescriptor): () => void;
    stopObservation(name?: string): this;
    observe(descriptor: TargetElementDescriptor): this;
}
export {};
