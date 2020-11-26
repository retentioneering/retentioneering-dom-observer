/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
import { EventEmitter } from "./EventEmitter"

const MAIN_OBSERVER_CONFIG = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: false,
    characterDataOldValue: false,
    attributeOldValue: false,
}

type TargetElementDescriptor = {
    name: string
    selector: string
    observerConfig?: MutationObserverInit
}

type TargetElementsObserver = {
    descriptor: TargetElementDescriptor
    observers: MutationObserver[]
}

type ObservedElement = {
    element: HTMLElement
    descriptor: TargetElementDescriptor
}

export const FOUND_EVENT_NAME = "target-element-found"
export const MUTATED_EVENT_NAME = "target-element-mutated"

export type FoundEvent = {
    type: typeof FOUND_EVENT_NAME
    descriptor: TargetElementDescriptor
    element: HTMLElement
}

export type MutatedEvent = {
    type: typeof MUTATED_EVENT_NAME
    descriptor: TargetElementDescriptor
    mutations: MutationRecord[]
}

export type ObserveDomEvent = FoundEvent | MutatedEvent

export type MainObserverCb = (mutations: MutationRecord[]) => void

type SubscribeCb = (e: ObserveDomEvent) => void

export class DomObserver extends EventEmitter {
    private _mainObserver: MutationObserver | null = null
    private _observedElements: ObservedElement[] = []
    private _targetElementsObservers: TargetElementsObserver[] = []
    private _targetElementsDescriptors: TargetElementDescriptor[] = []
    private _checkTargetSelectorAndObserve(
        descriptor: TargetElementDescriptor,
        el: HTMLElement,
        mutationsList: MutationRecord[],
    ) {
        const targetElements = el.matches(descriptor.selector)
            ? [el]
            : [...el.querySelectorAll<HTMLElement>(descriptor.selector)]

        if (!targetElements.length) {
            return
        }

        this._observeTargetElements(targetElements, descriptor)

        // check if the mutation of the target node is in the mutations list
        const matchedMutations = this._matchTargetElementMutations(
            descriptor,
            mutationsList
        )
        if (matchedMutations.length) {
            this._dispatchMutatedEvent(matchedMutations, descriptor)
        }
    }
    private _matchTargetElementMutations(
        descriptor: TargetElementDescriptor,
        mutationsList: MutationRecord[]
    ) {
        const matchedMutations = []
        for (const mutation of mutationsList) {
            if ((mutation.target as HTMLElement).closest(descriptor.selector)) {
                matchedMutations.push(mutation)
            }
        }
        return matchedMutations
    }
    private _observeTargetElements(
        elems: HTMLElement[],
        descriptor: TargetElementDescriptor
    ) {
        const observer = new window.MutationObserver(mutations =>
            this._onTargetElementMutated(mutations, descriptor)
        )
        for (const elem of elems) {
            const alreadyObserved = this._observedElements.some(
                ({ descriptor: foundDescriptor, element }) => {
                    return descriptor.name === foundDescriptor.name && element === elem
                }
            )
            if (alreadyObserved) continue
            this._observedElements.push({
                element: elem,
                descriptor,
            })
            this._dispatchFoundEvent(descriptor, elem)
            observer.observe(elem, descriptor.observerConfig)
        }
        const existingObserverItem = this._targetElementsObservers.find(
            found => found.descriptor.name === descriptor.name
        )
        if (existingObserverItem) {
            existingObserverItem.observers.push(observer)
        } else {
            this._targetElementsObservers.push({
                descriptor,
                observers: [observer],
            })
        }
    }
    private _onTargetElementMutated(
        mutations: MutationRecord[],
        descriptor: TargetElementDescriptor
    ) {
        this._dispatchMutatedEvent(mutations, descriptor)
    }
    private _dispatchMutatedEvent(
        mutations: MutationRecord[],
        descriptor: TargetElementDescriptor
    ) {
        const payload: MutatedEvent = {
            type: MUTATED_EVENT_NAME,
            descriptor,
            mutations,
        }
        this.dispatch("target-element-mutated", payload)
    }
    private _dispatchFoundEvent(
        descriptor: TargetElementDescriptor,
        element: HTMLElement
    ) {
        const payload: FoundEvent = {
            type: FOUND_EVENT_NAME,
            descriptor,
            element,
        }
        this.dispatch("target-element-found", payload)
    }
    private _onRootElementMutated = (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
            if (mutation.type !== "childList") continue
            for (const node of mutation.addedNodes) {
                if (!(node instanceof window.HTMLElement)) continue
                for (const descriptor of this._targetElementsDescriptors) {
                    this._checkTargetSelectorAndObserve(
                        descriptor,
                        node,
                        mutationsList
                    )
                }
            }

            this._clearObservedElementsByMutation(mutation)
        }
    }
    private _clearObservedElementsByMutation(mutation: MutationRecord) {
        this._observedElements = this._observedElements.filter(
            ({ element }) => {
                return ![...mutation.removedNodes].includes(element)
            }
        )
    }
    private _clearObservedElementsByDescriptor(
        descriptor: TargetElementDescriptor
    ) {
        this._observedElements = this._observedElements.filter(
            ({ descriptor: foundDescriptor }) => {
                return descriptor.name !== foundDescriptor.name
            }
        )
    }
    constructor(private _rootElement: HTMLElement = document.body) {
        super()
    }
    get observedElements() {
        return [...this._observedElements]
    }
    public start(cb?: MainObserverCb) {
        this._mainObserver = new window.MutationObserver(mutations => {
            this._onRootElementMutated(mutations)
            if (cb) {
                cb(mutations)
            }
        })
        this._mainObserver.observe(this._rootElement, MAIN_OBSERVER_CONFIG)
        return this
    }
    public stop() {
        if (this._mainObserver) {
            this._mainObserver.disconnect()
            this._onRootElementMutated(this._mainObserver.takeRecords())
            this._mainObserver = null
        }
        this.stopObservation()
        return this
    }
    public subscribe(cb: SubscribeCb, descriptor?: TargetElementDescriptor) {
        const handleEvent = (e: ObserveDomEvent) => {
            if (!descriptor) {
                cb(e)
                return
            }
            if (descriptor.name === e.descriptor.name) {
                cb(e)
            }
        }
        this.on<MutatedEvent>(MUTATED_EVENT_NAME, handleEvent)
        this.on<FoundEvent>(FOUND_EVENT_NAME, handleEvent)
        return () => {
            this.off(MUTATED_EVENT_NAME, handleEvent)
            this.off(FOUND_EVENT_NAME, handleEvent)
        }
    }
    public stopObservation(name?: string) {
        for (let i = 0; i < this._targetElementsObservers.length; i++) {
            const targetElementObserver = this._targetElementsObservers[i]
            if (name && targetElementObserver.descriptor.name !== name) continue

            this._clearObservedElementsByDescriptor(
                targetElementObserver.descriptor
            )

            for (const mObserver of targetElementObserver.observers) {
                const unhandledRecords = mObserver.takeRecords()
                if (unhandledRecords.length) {
                    this._onTargetElementMutated(
                        unhandledRecords,
                        targetElementObserver.descriptor
                    )
                }
                mObserver.disconnect()
            }
            this._targetElementsObservers.splice(i, 1)
            i--
        }
        if (!name) {
            this._targetElementsDescriptors = []
            return this
        }
        const updatedDescriptors = this._targetElementsDescriptors.filter(
            found => found.name !== name
        )
        this._targetElementsDescriptors = updatedDescriptors
        return this
    }
    public observe(descriptor: TargetElementDescriptor) {
        this._targetElementsDescriptors.push(descriptor)
        // element already exists
        const targetElements = [
            ...this._rootElement.querySelectorAll<HTMLElement>(
                descriptor.selector
            ),
        ]
        if (targetElements.length) {
            this._observeTargetElements(targetElements, descriptor)
        }
        return this
    }
}
