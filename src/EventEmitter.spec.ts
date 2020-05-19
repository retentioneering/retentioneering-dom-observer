/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
import { assert } from "chai"
import sinon from "sinon"
import { EventEmitter } from "./EventEmitter"

describe("EventEmitter", () => {
    it("subscribe", () => {
        const eventName = "some-event"
        const emitter = new EventEmitter()
        const handler = sinon.fake()
        emitter.on(eventName, handler)
        emitter.dispatch(eventName)
        assert(handler.called, "event handler must be called")
    })

    it("unsubscribe", () => {
        const eventName = "some-event"
        const emitter = new EventEmitter()
        const handler = sinon.fake()
        emitter.on(eventName, handler)
        emitter.dispatch(eventName)
        emitter.off(eventName, handler)
        assert(handler.callCount === 1, "handler should be called only once")
    })

    it("duplicate subscription", () => {
        const eventName = "some-event"
        const emitter = new EventEmitter()
        const handler = sinon.fake()
        emitter.on(eventName, handler)
        emitter.on(eventName, handler)
        emitter.dispatch(eventName)
        emitter.off(eventName, handler)
        emitter.dispatch(eventName)
        assert(handler.callCount === 1, "handler should be called only once")
    })

    it("unwatch", () => {
        const eventName = "some-event"
        const emitter = new EventEmitter()
        const handler = sinon.fake()
        const unwatch = emitter.on(eventName, handler)
        unwatch()
        emitter.dispatch(eventName)
        assert(!handler.called, "handler should not be called")
    })
})
