# Project Idea: Rag-Scanner (V2)

## Overview
Rag-Scanner is an advanced AI-powered document intelligence dashboard. It allows users to upload PDFs and interact with them through a natural language interface. Unlike simple RAG systems, it integrates an **Agentic Intent Routing** layer to understand whether a user wants to search documents, engage in general conversation, or escalate a complex issue to human support.

## Core Architecture & Features
- **Deterministic Multi-Tenancy**: 
  Uses custom logic (or authentication middleware) to map users to their own unique "document sandboxes", ensuring strict data privacy without complex setup.
- **Agentic Intent Classification**: 
  An LLM-driven `IntentRouter` classifies user prompts into specific strategies:
  - `RagStrategy`: Fetches contextual chunks from vector storage to answer document-based questions.
  - `GreetingStrategy`: Handles simple greetings and general conversing without hitting the vector DB.
  - `EscalationStrategy`: Automatically files support tickets for unanswerable/complex queries.
- **Robust Document Ingestion**: 
  The system uses a `SentenceAwareSplitter` to handle document chunking smarter than naive character limits, preserving full sentences for better retrieval quality. 
- **Idempotent Data Management**: 
  Uses smart checking and "Delete-before-Register" logic alongside PostgreSQL/Supabase to prevent duplicate active chunks.
- **Advanced Dashboard UI**: 
  A modern React + Vite + Tailwind interface. It features real-time chat with intent tags, a document manager, and a comprehensive ticket management portal.

## Technical Stack
- **Frontend**: React, TypeScript, TailwindCSS, Vite.
- **Backend**: Node.js, Express, TypeScript. Clean Architecture pattern (Domain, Application, Infrastructure, Presentation layers).
- **Core AI**: OpenAI GPT-4o (Chat/Parsing), HuggingFace Transformers (Embeddings).
- **Database/Vector Store**: PostgreSQL (Supabase) + pgvector.

## Project Goals
- Build a resilient, production-ready full-stack RAG pipeline.
- Implement source-aware responses with explicit page-level citations.
- Bridge the gap between automated AI responses and human-in-the-loop support via ticketing systems.