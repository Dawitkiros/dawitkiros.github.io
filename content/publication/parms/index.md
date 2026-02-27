---
title: "Enhancing Efficiency and Privacy in Federated Learning via Partial Model Sharing"
authors:
  - Dawit Kiros Redie
  - Reza Arablouei
  - Stefan Werner
date: "2025-11-01T00:00:00Z"
doi: ""

# Schedule page publish date (NOT publication's date).
publishDate: "2025-12-01T00:00:00Z"

# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ["paper-conference"]

# Publication name and optional abbreviated publication name.
publication: "59th Asilomar Conference on Signals, Systems, and Computers"
publication_short: ""

abstract: Communication overhead and privacy risks remain significant challenges in federated learning (FL). We introduce Partial Model Sharing (ParMS), a novel framework that enhances both communication efficiency and data privacy in FL. ParMS partitions model parameters into blocks, enabling each client to securely share only a small encrypted subset of parameters in each communication round. The central server aggregates these partial updates without directly accessing any client's complete model, mitigating privacy leakage, including leakage from gradient inversion attacks. We formally establish ParMS as a valid compression operator and provide theoretical guarantees for its convergence under standard assumptions. Extensive experiments show that ParMS substantially reduces communication and computational costs while improving resilience to privacy attacks, offering a practical and scalable approach for privacy-preserving FL.

tags:
  - Federated Learning
  - Homomorphic Encryption
  - Gradient Inversion Attacks
  - Communication Efficiency
featured: false

# links:
# - name: ""
#   url: ""
url_pdf: ""
url_code: ""
url_dataset: ""
url_poster: ""
url_project: ""
url_slides: ""
url_source: ""
url_video: ""

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ""
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []
# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---

<!-- {{% callout note %}}
Click the _Cite_ button above to import publication metadata into your reference management software.
{{% /callout %}} -->

<!-- {{% callout note %}}
Create your slides in Markdown - click the _Slides_ button to check out the example.
{{% /callout %}}

Add the publication's **full text** or **supplementary notes** here. You can use rich formatting such as including [code, math, and images](https://docs.hugoblox.com/content/writing-markdown-latex/). -->
