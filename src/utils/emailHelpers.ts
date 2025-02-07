export function extractEmail(fromField: string): string | null {
	// Regular expression to match an email address
	const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

	// Apply the regex to the input string
	const match = fromField.match(emailRegex);

	// Return the matched email or null if no match is found
	return match ? match[0] : null;
}

export function extractUserReply(body: string): string {
	// Patterns to identify the start of the quoted thread
	const replySeparators = [
		/On.*wrote:/i, // Matches "On <date>, <name> wrote:"
		/^>.*$/m, // Matches lines starting with ">"
		/-----Original Message-----/i, // Matches "-----Original Message-----"
		/From:.*$/i, // Matches "From: <email>"
		/Sent from my .*/i, // Matches mobile signatures like "Sent from my iPhone"
	];

	// Find the first occurrence of any separator
	for (const separator of replySeparators) {
		const index = body.search(separator);
		if (index !== -1) {
			return body.substring(0, index).trim(); // Extract content before the separator
		}
	}

	return body.trim(); // Return the whole body if no separator is found
}
