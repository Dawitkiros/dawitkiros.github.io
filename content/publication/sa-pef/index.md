---
title: "SA-PEF: Step-Ahead Partial Error Feedback for Efficient Federated Learning."
authors:
  - Dawit Kiros Redie
  - Reza Arablouei
  - Stefan Werner

date: "2026-01-30T00:00:00Z"
doi: ""

# Schedule page publish date (NOT publication's date).

publishDate: "2026-01-30T00:00:00Z"

# Publication type.

# Accepts a single type but formatted as a YAML list (for Hugo requirements).

# Enter a publication type from the CSL standard.

publication_types: ["article-journal"]

# Publication name and optional abbreviated publication name.

publication: "arXiv preprint"
publication_short: ""

abstract: ""

tags:
  - Federated Learning
  - Error Feedback
  - Compression
  - Distributed Optimization
featured: false

math: true

# links:

# - name: ""

# url: ""

url_pdf: "https://arxiv.org/abs/2601.20738"
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

{{% callout note %}}
Click the _Cite_ button above to import publication metadata into your reference management software.
{{% /callout %}}

## Abstract

Biased gradient compression with error feedback (EF) reduces communication in federated learning (FL), but under non-IID data, the residual error can decay slowly, causing gradient mismatch and stalled progress in the early rounds. We propose step-ahead partial error feedback (SA-PEF), which integrates step-ahead (SA) correction with partial error feedback (PEF). SA-PEF recovers EF when the step-ahead coefficient $\\alpha = 0$ and step-ahead EF (SAEF) when $\\alpha = 1$. For non-convex objectives and $\\delta$-contractive compressors, we establish a second-moment bound and a residual recursion that guarantee convergence to stationarity under heterogeneous data and partial client participation. The resulting rates match standard non-convex Fed-SGD guarantees up to constant factors, achieving $\\mathcal{O}((\\eta,\\eta_0TR)^{-1})$ convergence to a variance/heterogeneity floor with a fixed inner step size. Our analysis reveals a step-ahead-controlled residual contraction $\\rho_r$ that explains the observed acceleration in the early training phase. To balance SAEF's rapid warm-up with EF's long-term stability, we select $\\alpha$ near its theory-predicted optimum. Experiments across diverse architectures and datasets show that SA-PEF consistently reaches target accuracy faster than EF.

<!-- {{% callout note %}}
Create your slides in Markdown - click the _Slides_ button to check out the example.
{{% /callout %}} -->

<!-- Add the publication's **full text** or **supplementary notes** here. You can use rich formatting such as including [code, math, and images](https://docs.hugoblox.com/content/writing-markdown-latex/). -->
