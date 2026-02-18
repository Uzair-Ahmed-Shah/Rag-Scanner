# Project Idea: Rag-Scanner

## Overview
Rag-Scanner is a document analysis tool that helps users ask questions about large collections of PDF files. It uses **Retrieval-Augmented Generation (RAG)** to find relevant sections in documents and generate answers based on those sources.

The main focus of the project is building a reliable backend pipeline for document processing, retrieval, and citation-aware responses.

## Core Features
- **Iterative Search Logic**  
  If an initial document search does not return enough relevant information, the system can retry with refined queries.

- **PDF Processing & Embeddings**  
  PDFs are broken into chunks and converted into vector embeddings to enable semantic search.

- **Source & Citation Tracking**  
  Each answer includes references such as document name and page number so users can verify the results.

- **REST API Backend**  
  A TypeScript-based API that exposes document ingestion and query endpoints, designed with developers in mind.

## Project Goals
- Explore how RAG systems work in practice  
- Reduce hallucinated responses by grounding answers in documents  
- Learn about vector databases, backend architecture, and API design
