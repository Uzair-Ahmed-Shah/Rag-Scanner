export interface IPdfParser {
    parse(buffer: Buffer): Promise<string>;
}