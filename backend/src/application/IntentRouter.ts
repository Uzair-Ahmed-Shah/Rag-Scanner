import {ILLMService} from '../domain/interfaces/ILLMService'
import {IRoutingStrategy, RouteResponse} from './strategies/IRoutingStrategy'

interface IntentClassification {
    intent: 'KNOWLEDGE_QUERY' | 'HUMAN_ESCALATION' | 'GREETING';
    confidence: number
}

export class IntentRouter {
    private strategies: Record<string, IRoutingStrategy>;
    constructor(
        private llmService: ILLMService,
        ragStrategy: IRoutingStrategy,
        escalationStrategy: IRoutingStrategy,
        greetingStrategy: IRoutingStrategy
    ){
        this.strategies = {
            'KNOWLEDGE_QUERY': ragStrategy,
            'HUMAN_ESCALATION': escalationStrategy,
            'GREETING': greetingStrategy
        }
    }

    async routeQuery(query: string, userId?: string): Promise<any> {
        const systemPrompt = `
            You are an Intent Classifier for a corporate support system. 
            Classify the user's query into one of these three intents:
            - GREETING: Casual conversation or hellos.
            - KNOWLEDGE_QUERY: Questions about company documents or facts.
            - HUMAN_ESCALATION: Requests to speak to a human, complaints, or complex emotional issues.
            
            Return ONLY a JSON object with 'intent' and 'confidence' (0.0 to 1.0).
        `

        const classification = await this.llmService.generateStructuredOutput<IntentClassification>(
            [
                {role: 'system', content: systemPrompt},
                {role: 'user', content : query}
            ],
            { type: "object", properties: { intent: { type: "string" }, confidence: { type: "number" } } }
        );

        console.log(`[Intent Router] User said: "${query}" => Classified as: ${classification.intent} (${(classification.confidence * 100).toFixed(0)}% confident)`);

        const strategy = this.strategies[classification.intent];

        if (!strategy){
            throw new Error (`Strategy for intent ${classification.intent} not found`)
        }

        const result = await strategy.execute(query, [], userId);
        // @ts-ignore
        result.debug_intent = classification.intent;
        return result;
    }
}
