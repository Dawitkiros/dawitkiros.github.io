---
title: "Block-Wise Sparsification with Error Feedback for Communication-Efficient Federated Learning"
authors:
  - Dawit Kiros Redie
  - Reza Arablouei
  - Stefan Werner

date: "2026-06-01T00:00:00Z"
doi: ""

# Schedule page publish date (NOT publication's date).
publishDate: "2026-06-01T00:00:00Z"

# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ["paper-conference"]

# Publication name and optional abbreviated publication name.
publication: "The 34th European Signal Processing Conference (EUSIPCO)"
publication_short: ""

abstract: >-
  Federated learning (FL) enables collaborative training without sharing raw data, yet communicating high-dimensional model updates is a key bottleneck in bandwidth- and energy-constrained deployments.
  Coordinate-wise Top-k sparsification reduces the number of transmitted entries but can suffer large index overhead, as each selected coordinate requires a $\\lceil\\log_2 d\\rceil$-bit address; for modern models, these indices can constitute a substantial fraction of the uplink cost.
  We propose FedBlockEF, a communication-efficient FL method that partitions client model updates into $J$ contiguous blocks and transmits only the $B$ blocks with the largest $\\ell_2$ norms, while error feedback accumulates and re-injects information from unselected blocks.
  For additional savings, we introduce within-block sign quantization with an optimal per-block gain (least-squares scaling), which represents each transmitted block using only signs plus a single scalar.
  To mitigate block starvation, we incorporate an $\\varepsilon$-exploration mechanism that randomly selects blocks with small probability to promote occasional refresh of rarely selected blocks.
  We show that block-Top-B and its sign+gain variant satisfy $\\delta$-contractivity, allowing direct use within standard error-feedback convergence analyses.
  Experiments on standard FL benchmarks under IID and non-IID data partitions demonstrate that FedBlockEF achieves accuracy competitive with coordinate-wise sparsification baselines while substantially reducing total communication.
abstract_source: "https://www.eurasip.org/Proceedings/Eusipco/Eusipco2026/pdfs/0002431.pdf"
math: true

research_areas: [federated, communication]

tags:
  - Federated Learning
  - Sparsification
  - Error Feedback
  - Communication Efficiency
featured: false

url_pdf: "https://www.eurasip.org/Proceedings/Eusipco/Eusipco2026/pdfs/0002431.pdf"
url_code: ""
url_dataset: ""
url_poster: ""
url_project: ""
url_slides: ""
url_source: ""
url_video: ""

image:
  caption: ""
  focal_point: ""
  preview_only: false
---
