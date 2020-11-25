/**
 * By Alexey Avramenko and Retentioneering Team
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions.
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
declare type ParseTarget = "textContent" | string;
declare type ParserConfigObject = {
    type: "object";
    keys: {
        key: string;
        value: ParserConfig;
    }[];
};
declare type ParserConfigArray = {
    type: "array";
    selector: string;
    parseFrom?: ParseTarget;
    items?: ParserConfig;
};
declare type ParserConfigString = {
    type: "string";
    selector?: string;
    parseFrom?: ParseTarget;
};
declare type ParseConfigBoolean = {
    type: "boolean";
    selector: string;
};
declare type ParseConfigCount = {
    type: "count";
    selector: string;
};
declare type ParseConfigNumber = {
    type: "number";
    selector: string;
    parseFrom?: ParseTarget;
    formatter: (value: string | null, el: HTMLElement | null) => number | null;
};
export declare type ParserConfig = ParserConfigObject | ParserConfigArray | ParserConfigString | ParseConfigBoolean | ParseConfigNumber | ParseConfigCount;
export declare type ParseDomResult = string | null | boolean | number | Array<ParseDomResult> | {
    [key: string]: ParseDomResult;
};
/**
 * Parse a specific structure from the DOM recursively
 * @param  config - configuration object that describes the type of the resulting object and how to get it from the DOM
 * @param  rootElement - root DOM element. will be parsed inside the children of this element
 * @return result of parsing
 */
export declare function parseDOM(config: ParserConfig, rootElement?: HTMLElement): ParseDomResult;
export {};
