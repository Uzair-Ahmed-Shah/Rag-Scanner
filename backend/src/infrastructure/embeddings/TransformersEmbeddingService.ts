import {pipeline} from '@xenova/transformers'
import { IEmbeddingService} from '../../domain/interfaces/IEmbeddingService'

export class TransformersEmbeddingService implements IEmbeddingService{
    private extractor: any = null;
    private readonly modelName = 'Xenova/all-MiniLM-L6-v2';

    private async getExtractor() {
        if (!this.extractor) {
            this.extractor = await pipeline('feature-extraction', this.modelName)
        }
        return this.extractor
    }

    async generateEmbedding (text: string) : Promise<number[]> {
        const extractor = await this.getExtractor();
        const output = await extractor(text, {pooling: 'mean', normalize: true})
        return Array.from(output.data) as number[];
    }
}
