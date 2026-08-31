# Ignis website repository guidance

## Canonical working copy

- This repository is the live, GitHub-connected Ignis website working copy.
- The website source is in `website_structure/`.
- The GitHub remote is `https://github.com/yorik38/ignis-leaddership.git` and the publishing branch is `main`.
- Do not edit `/Users/yoriktisseau/Desktop/Claude/Ignis Content/website_structure` for live website requests. It is a non-publishing reference copy.

## Required check before editing

Before changing any website file:

1. Run `git rev-parse --show-toplevel` and confirm it resolves to this repository.
2. Run `git status --short` and preserve unrelated user changes.
3. Make and verify the requested change in this repository only.
4. When the user expects the change on GitHub, commit it and push it to `origin/main`.
5. If GitHub authentication blocks the push, clearly state that the commit exists only locally.
