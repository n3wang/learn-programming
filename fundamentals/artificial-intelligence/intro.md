---
sidebar_position: 1
title: Artificial Intelligence
---

# Artificial Intelligence

From classic search algorithms to modern transformers, this section builds up the theory and intuition behind AI systems — with interactive visualizers for the parts that are hardest to grasp from equations alone.

## AI Engineering

Practical, applied coverage of building with foundation models — not training them from scratch, but understanding the design decisions (training data, architecture, scale, post-training, sampling) that determine how a model behaves once it's in your application.

- [Understanding Foundation Models](./ai-engineering/01-understanding-foundation-models) — training data curation, transformer architecture, model scale and scaling laws, post-training (SFT/RLHF/DPO), and sampling (temperature, top-k/top-p, hallucination)
- [Tokens and Embeddings](./ai-engineering/02-tokens-and-embeddings) — tokenization methods (BPE, WordPiece, SentencePiece), comparing real tokenizers, static vs. contextualized embeddings, sentence/document embeddings, word2vec (skip-gram, negative sampling), and embeddings for recommendation systems
- [Looking Inside Large Language Models](./ai-engineering/03-looking-inside-llms) — the autoregressive generation loop, the forward pass (tokenizer → transformer blocks → LM head), decoding, context length, the KV cache, self-attention mechanics, and modern architecture tweaks (GQA, Flash Attention, RMSNorm, SwiGLU, RoPE)
- [Text Classification](./ai-engineering/04-text-classification) — task-specific representation models, embeddings + a lightweight classifier, zero-shot classification via cosine similarity, generative-model classification (Flan-T5, ChatGPT), and evaluation with precision/recall/F1
- [Prompt Engineering](./ai-engineering/06-prompt-engineering) — sampling parameters (temperature, top_p/top_k), modular prompt components, in-context learning, chain prompting, reasoning techniques (chain-of-thought, self-consistency, tree-of-thought), and output verification (examples and grammar-constrained sampling)
- [Advanced Text Generation Techniques and Tools](./ai-engineering/07-advanced-text-generation) — quantized model loading, LangChain chains (single and sequential), conversation memory (buffer, windowed, summary), and agents built on the ReAct (Thought/Action/Observation) framework
- [Semantic Search and Retrieval-Augmented Generation](./ai-engineering/08-semantic-search-and-rag) — dense retrieval, chunking strategies, ANN search and vector databases, reranking, MAP/nDCG evaluation, and RAG (grounded generation, query rewriting, multi-query, multi-hop, agentic RAG, and RAG evaluation)
- [Multimodal Large Language Models](./ai-engineering/09-multimodal-llms) — Vision Transformers (image patching), multimodal embeddings with CLIP/OpenCLIP (contrastive learning), and multimodal text generation with BLIP-2 (the Q-Former bridge, image captioning, visual question answering)
- [Creating Text Embedding Models](./ai-engineering/10-creating-text-embedding-models) — contrastive learning, cross-encoders vs. bi-encoders (SBERT), training with softmax/cosine-similarity/MNR loss, hard negative mining, fine-tuning pretrained checkpoints, Augmented SBERT (gold/silver data), and unsupervised learning with TSDAE for domain adaptation
- [Fine-Tuning Representation Models for Classification](./ai-engineering/11-fine-tuning-representation-models) — supervised BERT fine-tuning and layer freezing, few-shot classification with SetFit, continued pretraining with masked language modeling, and token-level named-entity recognition

## Planned Topics

### Search & Classical AI
- Uninformed search: BFS, DFS, iterative deepening
- Informed search: A*, heuristics, admissibility
- Adversarial search: Minimax, alpha-beta pruning — interactive game tree

### Machine Learning Fundamentals
- Supervised vs. unsupervised vs. reinforcement learning
- Bias-variance tradeoff — interactive demo
- Train/validation/test split and why it matters
- Gradient descent: batch, stochastic, mini-batch — loss surface visualizer

### Neural Networks
- The perceptron and its limits
- Backpropagation — step-by-step interactive walkthrough
- Activation functions: sigmoid, ReLU, GELU
- Vanishing/exploding gradients and normalization (BatchNorm, LayerNorm)

### Convolutional Networks
- Convolution as feature detection — interactive filter visualizer
- Pooling and receptive field
- ResNet skip connections

### Transformers & Attention
- Self-attention — interactive query/key/value demo
- Multi-head attention and positional encoding
- The transformer block
- How GPT/BERT differ

### Reinforcement Learning
- Markov decision processes
- Q-learning and the Bellman equation
- Policy gradient methods
- Exploration vs. exploitation

---

*Pages coming soon — check back or contribute a page using the template.*
