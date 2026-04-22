# Project Idea: Rag-Scanner (V2)

## Overview
Rag-Scanner is an AI-powered document intelligence dashboard. It allows users to upload PDFs and interact with them through a natural language interface. Unlike simple RAG systems, it uses **Intent-Based Routing** to distinguish between general conversation and document-specific queries.

## Core Features
- **Deterministic Multi-Tenancy**  
  Uses custom hashing logic to turn any username into a unique UUID, creating private "document sandboxes" for every user without complex auth.
- **Agentic Intent Routing**  
  The system automatically classifies user prompts to either search documents (`RagStrategy`), handle greetings (`GreetingStrategy`), or suggest human escalation (`EscalationStrategy`).
- **Idempotent Document Ingestion**  
  Prevents duplicate data by using a "Delete-before-Register" pattern linked via PostgreSQL Foreign Keys.
- **React Dashboard UI**  
  A modern, real-time interface for managing document history and chatting with the AI.

## Project Goals
- Build a production-ready RAG pipeline with **Clean Architecture**.
- Solve the "Duplicate Chunk" problem via database constraints.
- Implement source-aware responses with page-level citations.