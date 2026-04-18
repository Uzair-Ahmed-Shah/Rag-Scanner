import OpenAI from 'openai'
import {ILLMService, BaseMessage} from '../../domain/interfaces/ILLMService'

export class OpenAIService implements ILLMService {
    private client: OpenAI;
    private model = 'openai/gpt-oss-120b';

    constructor (apiKey: string) {
        this.client = new OpenAI({apiKey});
    }

    async generateCompletion(messages: BaseMessage[], temperature: number = 0.5): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: messages as any,
            temperature: temperature
        })
        return response.choices[0]?.message?.content || '';
    }

    async generateStructuredOutput<T>(messages: BaseMessage[], schema: any): Promise<T> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: messages as any,
            temperature: 0.0,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'intent_response',
                    strict: true,
                    schema: schema
                }
            }
        })

        const content = response.choices[0]?.message?.content || '{}'
        return JSON.parse(content) as T;
    }
}