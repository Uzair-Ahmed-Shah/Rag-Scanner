export interface ITextSplitter {
    split(text: string, chunkSize: number, overlap:number): string[];
}