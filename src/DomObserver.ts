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

type ObservedElement = {
    element: Element
    observer: MutationObserver
}

type TargetElementsObserver = {
    descriptor: TargetElementDescriptor
    observedElements: ObservedElement[]
}


export const FOUND_EVENT_NAME = "target-element-found"
export const MUTATED_EVENT_NAME = "target-element-mutated"

export type FoundEvent = {
    type: typeof FOUND_EVENT_NAME
    descriptor: TargetElementDescriptor
    element: Element
}

export type MutatedEvent = {
    type: typeof MUTATED_EVENT_NAME
    descriptor: TargetElementDescriptor
    mutations: MutationRecord[]
    element: Element
}

export type ObserveDomEvent = FoundEvent | MutatedEvent

export type MainObserverCb = (mutations: MutationRecord[]) => void

type SubscribeCb = (e: ObserveDomEvent) => void

export class DomObserver extends EventEmitter {
    private _mainObserver: MutationObserver | null = null
    private _targetElementsObservers: TargetElementsObserver[] = []
    private _targetElementsDescriptors: TargetElementDescriptor[] = []
    private _checkTargetSelectorAndObserve(
        descriptor: TargetElementDescriptor,
        el: Element,
        mutationsList: MutationRecord[],
    ) {
        const targetElements = [...el.querySelectorAll<Element>(descriptor.selector)]
        if (el.matches(descriptor.selector)) {
            targetElements.push(el)
        }
    
        if (!targetElements.length) {
            return
        }

        this._observeTargetElements(targetElements, descriptor)

        // check if the mutation of the target node is in the mutations list
        const targetElementsWithMutations = this._matchTargetElementMutations(
            descriptor,
            mutationsList
        )
        for (const { target, mutations } of targetElementsWithMutations) {
            this._dispatchMutatedEvent(target, mutations, descriptor)
        }
    }
    private _matchTargetElementMutations(
        descriptor: TargetElementDescriptor,
        mutationsList: MutationRecord[]
    ) {
        type TargetElementMutations = {
            target: Element
            mutations: MutationRecord[]
        }

        const targetElementsMutations: TargetElementMutations[] = []

        for (const mutation of mutationsList) {
            if (!(mutation.target instanceof Element)) continue
            const target = mutation.target.closest(descriptor.selector)
            if (!target) continue
            const existing = targetElementsMutations.find(
                (found) => found.target === target
            )
            if (existing) {
                existing.mutations.push(mutation)
            } else {
                targetElementsMutations.push({
                    target,
                    mutations: [mutation],
                })
            }
        }
        return targetElementsMutations
    }
    private _observeTargetElements(
        elems: Element[],
        descriptor: TargetElementDescriptor
    ) {
        const existing = this._targetElementsObservers.find((found) => {
            return found.descriptor === descriptor
        })

        const targetElementObservers: TargetElementsObserver = existing || {
            descriptor,
            observedElements: [],
        }

        if (!existing) {
            this._targetElementsObservers.push(targetElementObservers)
        }

        for (const elem of elems) {
            const alreadyObserved = targetElementObservers.observedElements.some(({ element }) => {
                return element === elem
            })
            if (alreadyObserved) continue

            const observer = new window.MutationObserver(mutations =>
                this._onTargetElementMutated(elem, mutations, descriptor)
            )
            this._dispatchFoundEvent(descriptor, elem)
            observer.observe(elem, descriptor.observerConfig)
            targetElementObservers.observedElements.push({
                element: elem,
                observer,
            })
        }
    }
    private _onTargetElementMutated(
        element: Element,
        mutations: MutationRecord[],
        descriptor: TargetElementDescriptor
    ) {
        this._dispatchMutatedEvent(element, mutations, descriptor)
    }
    private _dispatchMutatedEvent(
        element: Element,
        mutations: MutationRecord[],
        descriptor: TargetElementDescriptor
    ) {
        const payload: MutatedEvent = {
            type: MUTATED_EVENT_NAME,
            descriptor,
            mutations,
            element,
        }
        this.dispatch("target-element-mutated", payload)
    }
    private _dispatchFoundEvent(
        descriptor: TargetElementDescriptor,
        element: Element
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
                if (!(node instanceof window.Element)) continue
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
        if (!mutation.removedNodes || !mutation.removedNodes.length) {
            return
        }

        for (const { descriptor, observedElements } of this._targetElementsObservers) {
            for (let i = 0; i < observedElements.length; i++) {
                const { element, observer } = observedElements[i]
                if ([...mutation.removedNodes].includes(element)) {
                    const unhandledRecords = observer.takeRecords()
                    if (unhandledRecords.length) {
                        this._onTargetElementMutated(
                            element,
                            unhandledRecords,
                            descriptor
                        )
                    }
                    observer.disconnect()
                    observedElements.splice(i, 1)
                    i--
                }
            }
        }

        for (let i = 0; i < this._targetElementsObservers.length; i++) {
            const curr = this._targetElementsObservers[i]
            if (!curr.observedElements.length) {
                this._targetElementsObservers.splice(i, 1)
                i--
            }
        }
    }

    private _clearObservedElementsByDescriptor(
        descriptor: TargetElementDescriptor
    ) {
        const existingIndex = this._targetElementsObservers.findIndex((found) => {
            return found.descriptor === descriptor
        })

        if (existingIndex === -1) return

        const { observedElements } = this._targetElementsObservers[existingIndex]

        // stop all observers
        for (let i = 0; i < observedElements.length; i++) {
            const { element, observer } = observedElements[i]
            const unhandledRecords = observer.takeRecords()
            if (unhandledRecords.length) {
                this._onTargetElementMutated(
                    element,
                    unhandledRecords,
                    descriptor
                )
            }
            observer.disconnect()
            observedElements.splice(i, 1)
            i--
        }
    }
    constructor(private _rootElement: Element = document.body) {
        super()
    }

    get observed() {
        return this._targetElementsObservers   
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
            ...this._rootElement.querySelectorAll<Element>(
                descriptor.selector
            ),
        ]
        if (targetElements.length) {
            this._observeTargetElements(targetElements, descriptor)
        }
        return this
    }
}
