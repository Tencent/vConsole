# vConsole Development Notes

Reply in Simplified Chinese, but use English for code, comments, and Git.

## Workflow

### Coding
1. Evaluate feasibility. If accepted by user, use plan mode.
2. After implementation, update related `dev/*.html` test cases and `doc/*.md` documentation if necessary.
3. Update both `CHANGELOG.md` (English) and `CHANGELOG_CN.md` (Chinese) under the current unreleased version block.
  - Follows the existing entry format: `` `Category(Module)` Description. (PR/issue #xxx) ``
  - Common type categories: `Feat`, `Fix`, `Perf`, `Chore` (sorted by category)
  - Common modules: `Core`, `Network`, `Log`, `Storage`, `Element` (sorted by module)
4. Commit.

### Git
- Use English commit messages, format: `<type>(<module>): <subject>`
- Do not add `Co-Authored-By: Claude` to commit messages.
- Use `unset GITHUB_TOKEN && /opt/homebrew/bin/gh` to access GitHub (instead of `gh` below).
- Ask for user approval before committing or merging any changes.

### Issues

1. Fetch the issue with `gh issue view <N> --repo Tencent/vConsole`.
2. Read the relevant source files before drawing conclusions.
3. Determine the category:
   - **Bug**: investigate root cause, fix source, commit, update both changelogs.
   - **Usage / environment problem**: explain why it is not a vConsole bug and suggest directions.
   - **Feature request**: run coding task, then commit with `Closes #N`.
4. Draft a short, concise reply with neutral tone in the issue author's language. Show to user for confirmation, then post with:
   `gh issue comment <N> --repo Tencent/vConsole --body "..."`

### PRs

1. Fetch the PR diff and conversations from GitHub.
2. Read the affected local source files before judging the implementation.
3. Evaluate correctness and flag any issues found.
4. Merge with `gh pr merge <N> --repo Tencent/vConsole --squash` and run `git pull`.
5. Fix any remaining issues in the local copy, then update both changelogs.
6. Commit.
