---
sidebar_position: 1
title: Graphics
---

# Graphics

Computer graphics turns math into pixels. Whether you're writing a game engine, a data visualizer, or a UI renderer, understanding how the GPU pipeline works lets you write faster shaders, avoid driver pitfalls, and reason about visual artifacts.

## Planned Topics

### Math Foundations
- Vectors, dot product, cross product — geometric meaning
- Matrices and affine transforms: translate, rotate, scale
- Homogeneous coordinates and the perspective divide
- Quaternions for rotation

### Rasterization Pipeline
- Vertex processing and the MVP matrix transform (interactive demo)
- Triangle setup, rasterization, and barycentric coordinates
- Fragment shading and interpolation
- Depth buffer (z-fighting, reverse-z)
- The GPU pipeline stages — interactive simulator

### Shading
- Phong and Blinn-Phong lighting models
- Normal mapping
- PBR: metallic-roughness workflow
- Shadow maps and shadow acne

### Ray Tracing
- Ray-sphere and ray-triangle intersection
- BVH acceleration structures
- Path tracing and Monte Carlo integration
- Denoising

### Modern GPU Architecture
- SIMT execution model — warps and divergence
- Memory hierarchy: registers, shared memory, L1/L2, VRAM
- Compute shaders and GPU-driven rendering

---

*Pages coming soon — check back or contribute a page using the template.*
