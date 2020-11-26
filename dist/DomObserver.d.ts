/**
 * By Alexey Avramenko and Retentioneering Team
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions.
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
import { EventEmitter } from "./EventEmitter";
declare type TargetElementDescriptor = {
    name: string;
    selector: string;
    observerConfig?: MutationObserverInit;
};
declare type ObservedElement = {
    element: HTMLElement;
    descriptor: TargetElementDescriptor;
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
    get observedElements(): ObservedElement[];
    start(cb?: MainObserverCb): this;
    stop(): this;
    subscribe(cb: SubscribeCb, descriptor?: TargetElementDescriptor): () => void;
    stopObservation(name?: string): this;
    observe(descriptor: TargetElementDescriptor): this;
}
export {};
