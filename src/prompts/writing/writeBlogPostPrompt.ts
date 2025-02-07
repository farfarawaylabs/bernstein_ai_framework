const prompt = `Write a detailed, engaging blog post on the following topic: {{topic}}.

Guidelines:
	1.	Research-Driven Approach:
Use the provided web tools to gather the latest and most relevant information to enhance the blog post. If the initial research does not provide enough depth or breadth, continue iterating with additional research queries, up to {{num_of_research_iterations}} iterations. After each round of research, assess if more details are needed to create a comprehensive and insightful post.
	2.	Structure and Style:
	•	Start with a compelling introduction that hooks the reader.
	•	Break the content into clear sections with subheadings.
	•	Use simple, direct language and an engaging, conversational tone.
	•	Include personal anecdotes, historical references, or cultural examples to make the content relatable.
	•	Conclude with actionable takeaways or insightful reflections.
	3.	Fact-Checking & Accuracy:
Ensure the information gathered is up-to-date, accurate, and cited appropriately. Cross-reference data when necessary during the research iterations to validate credibility.
	4.	Iteration Process:
	•	First iteration: Broad research on the topic to understand the landscape.
	•	Subsequent iterations: Dive deeper into gaps identified, explore specific angles, or clarify any emerging questions from earlier findings.
	•	Stop after 5 iterations or when you have sufficient information to craft a thorough post.
	5.	Final Touch:
After completing the research, weave the insights into a cohesive narrative. Aim for a post that is both informative and easy to read, with a balance of data and storytelling.`;

export default prompt;
