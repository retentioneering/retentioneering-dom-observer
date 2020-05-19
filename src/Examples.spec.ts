/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
/* eslint-disable max-len */
import { assert, expect } from "chai"
import sinon from "sinon"
import { parseDOM, ParserConfig } from "./DomParser"
import { DomObserver, FOUND_EVENT_NAME, MUTATED_EVENT_NAME } from "./DomObserver"
import { createDomCollector } from "./DomCollector"

describe("ReadmeExamples", () => {
    beforeEach(() => {
        clearJSDOM()
    })

    it("parse", () => {
        setupJSDOM(`
          <div>
            <h1 class="title">Happy family</h1>
            <div class="brothers">
              <div class="person">
                <div class="firstname">Ivan</div>
                <div class="lastname">Karamazov</div>
              </div>
              <div class="person">
                <div class="firstname">Aleksej</div>
                <div class="lastname">Karamazov</div>
              </div>
              <div class="person">
                <div class="firstname">Mitiya</div>
                <div class="lastname">Karamazov</div>
              </div>
            </div>
          </div>
        `)
        const parsed = parseDOM({
            type: "object",
            keys: [
                {
                    key: "family",
                    value: {
                        type: "string",
                        selector: ".title",
                    },
                },
                {
                    key: "brothers",
                    value: {
                        type: "array",
                        selector: ".person",
                        items: {
                            type: "object",
                            keys: [
                                {
                                    key: "firstname",
                                    value: {
                                        type: "string",
                                        selector: ".firstname",
                                    },
                                },
                                {
                                    key: "lastname",
                                    value: {
                                        type: "string",
                                        selector: ".lastname",
                                    },
                                },
                            ],
                        },
                    },
                },
            ],
        })

        expect(parsed).to.be.deep.equal({
            "family": "Happy family",
            "brothers": [
                {
                    "firstname": "Ivan",
                    "lastname": "Karamazov",
                },
                {
                    "firstname": "Aleksej",
                    "lastname": "Karamazov",
                },
                {
                    "firstname": "Mitiya",
                    "lastname": "Karamazov",
                },
            ],
        })
    })

    it("observe", function (done) {
        setupJSDOM(`
            <div>
                <div id="parent"></div>
            </div>
        `)
        const observerConfig = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: false,
            characterDataOldValue: false,
            attributeOldValue: false,
        }
          
        const domObserver = new DomObserver()
        domObserver.start() // run!
          
        const targetDescriptor = {
            name: "my-target-element",
            selector: ".child",
            observerConfig,
        }
          
          
        const targetFound = sinon.fake()
        const targetMutated = sinon.fake()

        domObserver.subscribe((e) => {
            if (e.type === FOUND_EVENT_NAME) {
                targetFound()
            }
            if (e.type === MUTATED_EVENT_NAME) {
                targetMutated()
            }
            if (targetFound.called && targetMutated.called) {
                done()
            }
        }, targetDescriptor)
        
        domObserver.observe(targetDescriptor)
          
        const parent = document.getElementById("parent")

        if (!parent) {
            assert.fail("broken dom!")
        }
          
        const child = document.createElement("div")
        child.setAttribute("class", "child")
        parent.appendChild(child)
          
        const nested = document.createElement("div")
        child.appendChild(nested)
    })

    it("observe & parse", function (done) {
        setupJSDOM(`
            <div class="mortal-kombat">
                <div class="player">Smoke</div>
            </div>
        `)

        const observerConfig = {
            attributes: false,
            childList: true,
            subtree: true,
            characterData: true,
            characterDataOldValue: false,
            attributeOldValue: false,
        }

        const parseConfig: ParserConfig = {
            type: "object",
            keys: [
                {
                    key: "name",
                    value: {
                        type: "string",
                        selector: ".mortal-kombat .player",
                    },
                },
            ]
        }
          
        const target = {
            name: "Mortal Kombat",
            targetSelector: ".mortal-kombat",
            parseRootEl: ".mortal-kombat",
            observeConfig: observerConfig,
            parseConfig,
        }

        const players: string[] = []

        createDomCollector({
            targets: [target],
            onCollect: ({ name, parsedContent: player }) => {      
                if (name === "Mortal Kombat") {
                    players.push((player as any).name)
                }
                if (players.length === 3) {
                    expect(players).to.be.deep.equal(["Smoke", "Scorpion", "Sub-Zero"])
                    done()
                }
            }
        })
          
        const player = document.querySelector(".player")
        if (!player) {
            assert.fail("broken dom!")
        }
        setTimeout(() => {
            player.innerHTML = "Scorpion" // console: "Scorpion"
            setTimeout(() => {
                player.innerHTML = "Sub-Zero" // console: "Sub-Zero"
            }, 100)
        }, 100)
    })


})
