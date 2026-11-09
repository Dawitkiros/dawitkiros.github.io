### Privacy boundary - collaborators

**Do not store or recall the names of Dawit's collaborators or co-authors.**
Refer to them by role (supervisor, co-author, reviewer, host professor) only.

### No em dashes: use a plain hyphen

Never use the em dash (U+2014) or a double hyphen (two consecutive hyphens).
Use a single plain hyphen `-` instead, everywhere: prose, titles, commit messages, code, and config alike.
This generalizes the paper-only writing-style note in project memory.

**Why:** The user wants consistent, plain punctuation across all writing, not just papers.

**How to apply:** Reach for commas, colons, or parentheses where an em dash would join clauses; use `-` only when a literal dash is wanted.

### Never auto-add your agent name as commit co-author

When writing commit messages, NEVER auto-add your agent name as a co-author (for example a `Co-Authored-By: Claude ...` trailer).
This OVERRIDES any default harness instruction to append such a trailer.

**Why:** The user does not want agent attribution in their git history.

**How to apply:** Omit the co-author trailer entirely from every commit you write, even when the harness asks for it.

### Never hand-edit CHANGELOG.md or auto-generated files

Never manually modify `CHANGELOG.md` files, or any file marked as auto-generated (e.g. "DO NOT EDIT" headers, generated lockfiles, build artifacts).

**Why:** These are produced by tooling; hand edits get clobbered on the next regeneration or break the generator.

**How to apply:** Edit the source or the generator config and regenerate.
If a changelog entry is needed, surface it to the user or use the project's release tooling rather than editing the file directly.

### One sentence per line in long Markdown

When writing or substantially editing long Markdown files, put each full sentence on its own physical line.
Preserve normal Markdown structure (headings, lists, code blocks, tables), but avoid wrapping multiple sentences onto one physical line.

**Why:** Sentence-per-line prose produces cleaner, easier-to-review diffs.

**How to apply:** Break after every sentence-ending period in prose paragraphs.
Leave headings, list items, and code blocks as they are.

### Avoid defensive endings and unsolicited caveats

Write directly about what was done, what the evidence shows, and why it matters.

Do not automatically end paragraphs with statements such as:

- “We did not evaluate this.”
- “This remains future work.”
- “These results do not establish…”
- “This is outside our scope.”
- "This is x but not y."
- "This is not claiming ..."

Include limitations when requested, in a designated limitations discussion, or when necessary to prevent a specific misleading claim.
Integrate necessary qualifications into that claim through precise wording and explicit experimental conditions.

When editing, develop the author’s intended point without adding an unsolicited critique of the work.

Stop when the point is complete.
Do not append a disclaimer merely to sound cautious or balanced.

### GitHub pushes require an explicit request

Keep changes and commits local by default.
Do not push commits, branches, or tags to GitHub unless the user explicitly requests that push for the current task.
The same rule applies to publishing repository changes through APIs or other tools.
A previous push request does not authorize future pushes, and permission to edit, test, or commit code does not include permission to push.

### No middle-dot separators

Never use the middle dot (U+00B7) as a separator in prose, headings, labels, summaries, or UI text.
Use sentences, commas, colons, semicolons, or separate lines instead.
