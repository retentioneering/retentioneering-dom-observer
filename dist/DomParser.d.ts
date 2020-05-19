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
    items?: ParserConfig;
};
declare type ParserConfigString = {
    type: "string";
    selector: string;
};
declare type ParseConfigBoolean = {
    type: "boolean";
    selector: string;
};
export declare type ParserConfig = ParserConfigObject | ParserConfigArray | ParserConfigString | ParseConfigBoolean;
export declare type ParseDomResult = string | null | boolean | Array<ParseDomResult> | {
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
