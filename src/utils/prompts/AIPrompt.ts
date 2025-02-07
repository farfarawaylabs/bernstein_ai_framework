export class AIPrompt {
	static loadPrompt(prompt: string, vars: Record<string, string>[]): string {
		return vars.reduce((currentPrompt, varSet) => {
			return Object.entries(varSet).reduce((acc, [key, value]) => {
				const regex = new RegExp(`{{${key}}}`, 'g');
				return acc.replace(regex, value);
			}, currentPrompt);
		}, prompt);
	}
}
