# vConsole Development Notes

Reply in Simplified Chinese, but use English for code, comments, and Git.

## Workflow

### After completing a feature or fix
- Update both `CHANGELOG.md` (English) and `CHANGELOG_CN.md` (Chinese) under the current unreleased version block.
- Follow the existing entry format: `` `Category(Module)` Description. (PR/issue #xxx) ``
- Common categories: `Feat`, `Fix`, `Perf`, `Chore`
- Common modules: `Core`, `Network`, `Log`, `Storage`, `Element`

## Git
- Do not add `Co-Authored-By: Claude` to commit messages.
- Use `/opt/homebrew/bin/gh` to access GitHub.

## Handling PRs

1. Fetch the PR diff from GitHub.
2. Read the affected local source files before judging the implementation.
3. Evaluate correctness and flag any issues found.
4. After user approval, merge with `unset GITHUB_TOKEN && /opt/homebrew/bin/gh pr merge <N> --repo Tencent/vConsole --squash` and run `git pull`.
5. Fix any remaining issues in the local copy, then update both changelogs.
