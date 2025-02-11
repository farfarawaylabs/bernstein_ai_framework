# Bernstein AI - "Deep Research" AI Agents

## Introduction

Welcome to the Bernstein AI framework repository. This project is focused on building and running "deep research" style agents. These agents are designed to perform multiple tasks, interact with users, and manage their operational states efficiently. The goal is to provide a composable framework that can be adapted to different projects with diverse requirements.

## General Description

The repository can be divided into two main parts:

- **Framework**: The core framework for building and running agents, located under the [`framework`](./src/framework) folder.
- **Backend**: A fully working backend that demonstrates how to utilize the framework to build and run agents.

## Key Features

- **Framework, Not a Product**: Designed as a TypeScript-based backend framework with only one dependency, langchain. Easily integrate it into your own projects.
- **Pluggable Architecture**: Seamlessly plug in your own database, cache service, and more.
- **Model Agnostic**: Not tied to OpenAI; utilize any model available. Combine models for different tasks (e.g., Gemini for research, Claude for writing, ChatGPT for proofreading).
- **State Management**: Agents can sleep and wake up for future tasks, such as monitoring stock prices over a month.
- **Interactive Process**: Capable of pausing for user feedback. Currently supports email communication, with the flexibility to add other channels.
- **Comprehensive Research Tools**: Equipped with tools for Perplexity, Google search, and web crawling. Easily extendable to include additional tools.
- **Composable Architecture**: Architected like Lego, allowing for the creation of agents that delegate tasks to other agents.
- **Deep Research Capabilities**: Capable of extensive research, writing, and rewriting. Highly configurable to suit your operational needs.

## Framework Components

- **Conductor** ([`conductor.ts`](./src/framework/conductor.ts)): Orchestrates the lifecycle of an AI agent, managing conversation flow, task delegation, and user input handling.

- **Operator** ([`operators.ts`](./src/framework/operators.ts)): Manages and executes agent tools (skills), providing methods to retrieve and execute them either sequentially or in parallel.

- **Operator Serializers**: Developers can plug in serializers to persist every tool call and its result that the agent performs (including any agent that work was delegated to). The repository includes a sample operator that persists its state to Supabase ([`SupabaseOperator.ts`](./src/operators/SupabaseOperator.ts)).

- **Skills (Tools)**: Users can encapsulate any function as a tool to enhance agent capabilities. A variety of pre-built skills are available under the [`tools`](./src/tools) folder, serving as examples for building custom tools.

- **Conversation and State**: The conductor uses these to persist the state of a task. Developers can plug in their own state management solutions, with example implementations for Cloudflare KV and Supabase available under the [`state`](./src/state) folder.

## How to Build and Run Agents

To build an agent, developers need to implement the abstract class [`BaseAgent`](./src/framework/agents/BaseAgent.ts). This provides a structured way to define the agent's behavior and capabilities. You can find multiple sample implementations of agents under the [`@agents`](./src/agents) folder to see how to build them.

### Key Points:

- **Encapsulation as Tools**: Agents can be encapsulated as tools and provided to other agents as skills. This allows agents to delegate work to other agents, creating a flexible and scalable system. Developers can see examples of this under the [`tools`](./src/tools) folder.

- **Delegation and Composition**: The framework's flexibility comes from its ability to delegate tasks across multiple agents. Agents can delegate work to other agents, which can further delegate tasks, creating a chain of responsibility and expertise.

This composability and extensibility make the Bernstein AI framework a powerful tool for building complex, multi-functional AI systems.

## How to Run the Full Backend

This backend is written as a "demo" to showcase how to utilize the framework. It is not intended to be a full production backend.

### Steps to Run:

1. **Cloudflare Workers**: The backend is based on Cloudflare Workers. You need to create a Cloudflare account to proceed.

2. **API Keys**: Add a `.dev.vars` file and include all the necessary API keys. You can find the required keys in the [`Env.ts`](./src/Env.ts) file. If certain services are not needed, you can remove them from the code.

3. **KV Serializer**: If you want to use the KV serializer, create a KV namespace in Cloudflare.

4. **Supabase Serializer**:

   - Create a Supabase account.
   - Run the migrations located in the [`@supabase`](./src/supabase) folder.
   - Generate TypeScript types by running `npm run gendbtypes`.

5. **Run and Deploy**:
   - Start the development server with `npm run dev`.
   - Deploy the application using `npm run deploy`.

### Backend Structure

The backend is built in three tiers:

- **API**: Holds the routes and serves as the entry point to the backend. Located in the [`@api`](./src/api) folder.
- **BL (Business Logic)**: Encapsulates the business logic of starting and running a Conductor with specific agents. Located in the [`@bl`](./src/bl) folder.
- **DL (Data Layer)**: Encapsulates access to the database to support a web app that can be built on top of the backend. Located in the [`@dl`](./src/dl) folder.

The easiest way to learn how to use the entire framework is to follow the code path starting with the routes in the [`@api`](./src/api) folder.

These steps will help you set up and run the backend, allowing you to explore the capabilities of the Bernstein AI framework.

## About the Author

Shahar Nechmad is the author. He is the founder of multiple startups and built this platform over a weekend to showcase what can be done with "deep research" style agents that know to take complex tasks and run with them.

You can find and contact him at [LinkedIn](https://linkedin.com/in/nechmad).

## Support and Bugs

Developers can send any feedback or requests to framework@bernsteinai.com.

## Why the Name Bernstein?

As the main capability of the framework is to orchestrate/conduct multiple agents working together, I thought naming it after one of the most famous conductors of all time, Leonard Bernstein, is appropriate.
