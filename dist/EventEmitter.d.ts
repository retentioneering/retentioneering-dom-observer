declare type EventHadler<P = any> = (p: P) => any;
export declare class EventEmitter {
    private events;
    private createUnwatcher;
    on<P = any>(eventName: string, handler: EventHadler<P>): () => void;
    off<P = any>(eventName: string, handler: EventHadler<P>): void;
    dispatch<P = any>(eventName: string, payload?: P): void;
}
export {};
