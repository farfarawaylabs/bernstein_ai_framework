import { Conductor } from '@/framework/conductor';

export abstract class BaseAgent {
	protected prompt: string;
	protected conductor: Conductor | undefined;

	constructor() {
		this.prompt = '';
	}

	getConductor() {
		return this.conductor;
	}

	abstract run(): Promise<any>;
}
