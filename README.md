# test-coderabbit

A project designed to systematically test CodeRabbit's AI code review capabilities and boundaries.

## Purpose

This repository contains intentionally flawed code across multiple dimensions to evaluate how well CodeRabbit detects bugs, security vulnerabilities, performance issues, and other code quality problems. A clean-code control group is included to measure false positive rates.

## Project Structure

```
test-coderabbit/
├── .coderabbit.yaml              # CodeRabbit configuration (assertive mode, all tools enabled)
├── .gitignore
├── package.json
├── biome.json                    # Biome linter/formatter config
├── README.md
├── src/
│   ├── 01-bugs/                  # Dimension 1: Bug detection
│   │   └── buggy-code.js         # Null deref, off-by-one, race conditions, logic errors, etc.
│   ├── 02-security/              # Dimension 2: Security vulnerability detection
│   │   └── vulnerable-code.js    # SQL injection, XSS, command injection, hardcoded secrets, etc.
│   ├── 03-performance/           # Dimension 3: Performance anti-pattern detection
│   │   └── slow-code.js          # O(n²) algorithms, memory leaks, sync I/O, N+1 queries, etc.
│   ├── 04-js-traps/              # Dimension 4: JavaScript dynamic type traps
│   │   └── dynamic-type-traps.js # == vs ===, typeof quirks, this binding, closure traps, etc.
│   ├── 05-best-practices/        # Dimension 5: Best practice violations
│   │   └── anti-patterns.js      # Poor naming, magic numbers, god functions, callback hell, etc.
│   ├── 06-edge-cases/            # Dimension 6: Edge case handling
│   │   └── edge-cases.js         # ReDoS, Unicode handling, date/timezone, floating-point, etc.
│   └── 07-good-code/             # Control group: High-quality code (expect minimal findings)
│       └── clean-code.js         # Strategy pattern, proper validation, JSDoc, immutability, etc.
├── scripts/
│   └── deploy.sh                 # ShellCheck integration test
├── Dockerfile                    # Hadolint integration test
└── docs/
    ├── api.md                    # markdownlint integration test
    └── coderabbit-config.md      # Configuration field reference
```

## Test Dimensions

| # | Dimension | File | Expected Findings |
|---|-----------|------|-------------------|
| 1 | Bug Detection | `src/01-bugs/buggy-code.js` | 10 intentional bugs |
| 2 | Security Vulnerabilities | `src/02-security/vulnerable-code.js` | 10 OWASP-style vulnerabilities |
| 3 | Performance Issues | `src/03-performance/slow-code.js` | 7 performance anti-patterns |
| 4 | JS Type Traps | `src/04-js-traps/dynamic-type-traps.js` | 10 dynamic type pitfalls |
| 5 | Best Practices | `src/05-best-practices/anti-patterns.js` | 9 code smell categories |
| 6 | Edge Cases | `src/06-edge-cases/edge-cases.js` | 6 edge case categories |
| 7 | Clean Code (Control) | `src/07-good-code/clean-code.js` | Minimal (false positive test) |
| 8 | Shell Script | `scripts/deploy.sh` | ShellCheck violations |
| 9 | Dockerfile | `Dockerfile` | Hadolint violations |
| 10 | Markdown | `docs/api.md` | markdownlint violations |

## Tool Integrations Tested

- **ESLint** + **Biome** — JavaScript linting
- **Gitleaks** + **TruffleHog** — Secret detection
- **ShellCheck** — Shell script analysis
- **Hadolint** — Dockerfile linting
- **markdownlint** — Markdown formatting
- **Semgrep** / **OpenGrep** / **ast-grep** — Static analysis

## How to Evaluate

1. Create a PR from the `test/all-capabilities` branch to `main`
2. Observe CodeRabbit's automatic review
3. Test interactive commands: `@coderabbitai full review`, `@coderabbitai generate docstrings`
4. Compare detected issues against the intentionally planted problems
5. Note any false positives in the clean-code control group

## License

MIT
