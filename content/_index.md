---
# Leave the homepage title empty to use the site title
title: ""
date: 2025-08-22
type: landing

sections:
  - block: about.biography
    id: about
    content:
      title:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
  - block: skills
    content:
      title: Skills
      text: ""
      # Choose a user to display skills from (a folder name within `content/authors/`)
      username: admin
    design:
      columns: "2"
  - block: experience
    content:
      title: Experience
      # Date format for experience
      #   Refer to https://docs.hugoblox.com/customization/#date-format
      date_format: Jan 2006
      # Experiences.
      #   Add/remove as many `experience` items below as you like.
      #   Required fields are `title`, `company`, and `date_start`.
      #   Leave `date_end` empty if it's your current employer.
      #   Begin multi-line descriptions with YAML's `|2-` multi-line prefix.
      items:
        - title: PhD Researcher and Teaching Assistant
          company: NTNU
          company_url: "https://www.ntnu.no/"
          company_logo: ntnu
          location: Trondheim, Norway
          date_start: "2023-12-01"
          date_end: ""
          description: |2-
            * Developing privacy-preserving and personalized federated learning methods; studying heterogeneity, compression, and partial participation.
            * Designing communication-efficient training ideas (e.g., sparsification/quantization with error feedback) with theoretical analyses.
            * Building reproducible research code in Python/PyTorch and running controlled sweeps on GPU/HPC environments.
            * Teaching assistant for TTT4275 (Estimation, Detection and Classification) and TTT4120 (Digital Signal Processing).
        - title: Data Scientist
          company: "ReLU | Collaboration with Oslo University Hospital (OUS)"
          company_url: "https://reluntnu.no/segmentation-of-abdominal-aortic-aneurysms"
          company_logo: relu_ntnu
          location: Trondheim, Norway
          date_start: "2025-09-01"
          date_end: ""
          description: |2-
            * Building an end-to-end pipeline for Abdominal Aortic Aneurysm (AAA) segmentation from abdominal CT, using TotalSegmentator for organ masks, aorta seed points, and geometry/boundary constraints.
            * Developing a global controller for SO(3)-equivariant aorta tracking and contributing to dataset preparation and reproducible experiments (splits, metrics, ablations).
            * Project: [Segmentation of Abdominal Aortic Aneurysms (ReLU NTNU)](https://reluntnu.no/segmentation-of-abdominal-aortic-aneurysms)
        - title: Data Engineer Intern
          company: Johnson Controls
          company_url: "https://www.johnsoncontrols.com/"
          company_logo: jci
          location: Pune, India
          date_start: "2023-01-01"
          date_end: "2023-09-01"
          description: |2-
            * Built a data-loss detection service using Spring Boot, automating ~12 hours of manual work.
            * Reduced data processing time by 50% by transitioning Spark jobs to PySpark and optimizing ETL workflows.
            * Engineered synchronization between Snowflake and PostgreSQL to ensure reliable, consistent data flow.
            * Developed a predictive maintenance model using historical equipment data to reduce downtime and maintenance costs.

        - title: Teaching Assistant in Data Structures
          company: KIIT University
          company_url: "https://kiit.ac.in/"
          company_logo: kiit
          location: Bhubaneswar, India
          date_start: "2022-09-01"
          date_end: "2023-01-01"
          description: |2-
            * Supported lectures and labs; provided 1:1 and small-group instruction and grading support.
            * Designed and delivered practice material in C++/Python (arrays, trees, graphs, complexity), improving student engagement and mastery.

        - title: Research Intern in AI Applications
          company: KIIT University
          company_url: "https://kiit.ac.in/"
          company_logo: kiit
          location: Bhubaneswar, India
          date_start: "2020-07-01"
          date_end: "2020-09-01"
          description: |2-
            Explored applications of artificial intelligence in power electronics; implemented small prototypes and literature reviews to evaluate feasibility.
    design:
      columns: "2"
  # - block: accomplishments
  #   content:
  #     # Note: `&shy;` is used to add a 'soft' hyphen in a long heading.
  #     title: "Accomplish&shy;ments"
  #     subtitle:
  #     # Date format: https://docs.hugoblox.com/customization/#date-format
  #     date_format: Jan 2006
  #     # Accomplishments.
  #     #   Add/remove as many `item` blocks below as you like.
  #     #   `title`, `organization`, and `date_start` are the required parameters.
  #     #   Leave other parameters empty if not required.
  #     #   Begin multi-line descriptions with YAML's `|2-` multi-line prefix.
  #     items:
  #       - certificate_url: https://www.coursera.org
  #         date_end: ""
  #         date_start: "2021-01-25"
  #         description: ""
  #         icon: coursera
  #         organization: Coursera
  #         organization_url: https://www.coursera.org
  #         title: Neural Networks and Deep Learning
  #         url: ""
  #       - certificate_url: https://www.edx.org
  #         date_end: ""
  #         date_start: "2021-01-01"
  #         description: Formulated informed blockchain models, hypotheses, and use cases.
  #         icon: edx
  #         organization: edX
  #         organization_url: https://www.edx.org
  #         title: Blockchain Fundamentals
  #         url: https://www.edx.org/professional-certificate/uc-berkeleyx-blockchain-fundamentals
  #       - certificate_url: https://www.datacamp.com
  #         date_end: "2020-12-21"
  #         date_start: "2020-07-01"
  #         description: ""
  #         icon: datacamp
  #         organization: DataCamp
  #         organization_url: https://www.datacamp.com
  #         title: "Object-Oriented Programming in R"
  #         url: ""
  #   design:
  #     columns: "2"
  - block: collection
    id: publications
    content:
      title: Recent Publications
      text: |-
        {{% callout note %}}
        See all publications [here](./publication/).    
        {{% /callout %}}
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      columns: "2"
      view: citation
  - block: collection
    id: awards
    content:
      title: Awards
      text: |-
        * Ethiopian Betre-Science Government Scholarship (Aug 2017)
        * KIIT Merit Scholarship (Feb 2019 – Jul 2021)
        * Vice-Chancellor’s Silver Medal (Aug 2021)

        {{% callout note %}}
        See all awards [here](./awards/).
        {{% /callout %}}
      filters:
        folders:
          - awards
    design:
      columns: "2"
      view: list
  - block: collection
    id: posts
    content:
      title: Recent Posts
      subtitle: ""
      text: ""
      # Choose how many pages you would like to display (0 = all pages)
      count: 5
      # Filter on criteria
      filters:
        folders:
          - post
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      # Choose how many pages you would like to offset by
      offset: 0
      # Page order: descending (desc) or ascending (asc) date.
      order: desc
    design:
      # Choose a layout view
      view: compact
      columns: "2"
  - block: collection
    id: projects
    content:
      title: Projects
      text: ""
      filters:
        folders:
          - project
    design:
      view: card
      columns: "2"
  #     view: showcase
  #     # For Showcase view, flip alternate rows?
  #     flip_alt_rows: false
  # - block: markdown
  #   content:
  #     title: Gallery
  #     subtitle: ""
  #     text: |-
  #       {{< gallery album="demo" >}}
  #   design:
  #     columns: "1"
  # - block: collection
  #   id: featured
  #   content:
  #     title: Featured Publications
  #     filters:
  #       folders:
  #         - publication
  #       featured_only: true
  #   design:
  #     columns: "2"
  #     view: card
  - block: collection
    id: talks
    content:
      title: Recent & Upcoming Talks
      filters:
        folders:
          - event
    design:
      columns: "2"
      view: compact
  - block: tag_cloud
    content:
      title: Popular Topics
    design:
      columns: "2"
  - block: contact
    id: contact
    content:
      title: Contact
      subtitle:
      text: |-
        Feel free to reach out to me for any inquiries or collaborations. I'm always open to discussing new projects, creative ideas, or any opportunities.
      # Contact
      email: dawit.k.redie@gmail.com
      phone:
      appointment_url:
      address:
        street: C337, Elektro C Gløshaugen
        city: Trondheim
        region: Trøndelag
        postcode: "7034"
        country: Norway
        country_code: no
      # Choose a map provider in `params.yaml` to show a map from these coordinates
      coordinates:
        latitude: "63.418546"
        longitude: "10.400451"
      contact_links:
        - icon: x
          icon_pack: custom
          name: DM Me
          link: "https://x.com/dawit_kiros_"
      # Automatically link email and phone or display as text?
      autolink: true
      # Email form provider
      form:
        provider: formspree
        formspree:
          id: manqjdwd
        netlify:
          # Enable CAPTCHA challenge to reduce spam?
          captcha: false
    design:
      columns: "2"
---
