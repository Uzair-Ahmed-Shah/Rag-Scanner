import {ILLMService} from '../domain/interfaces/ILLMService'
import {IRoutingStrategy} from './strategies/IRoutingStrategy'

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

    async routeQuery (query: string): Promise<any> {}
}
