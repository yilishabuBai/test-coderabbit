# `.coderabbit.yaml` 字段说明

本文档对应仓库根目录的 `.coderabbit.yaml`，用于说明每个字段的作用和当前配置意图。

## 顶层字段

### `$schema` 注释

- `# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json`
- 作用：给编辑器（如 VS Code/Cursor）提供 YAML Schema，获得自动补全和校验能力。
- 说明：这是注释，不会被 CodeRabbit 作为运行配置读取。

### `language`

- 当前值：`zh-CN`
- 作用：设置 CodeRabbit 输出语言（审查评论、总结、交互内容等）。

### `tone_instructions`

- 当前值：`请用专业但友好的语气进行审查...`
- 作用：约束 CodeRabbit 的表达风格和反馈方式。

### `early_access`

- 当前值：`true`
- 作用：启用 CodeRabbit 的早期预览能力（可能包含实验性功能）。

### `enable_free_tier`

- 当前值：`true`
- 作用：允许使用免费层可用能力（若账号/组织策略允许）。

---

## `reviews`（代码审查主配置）

### 审查强度与流程

#### `reviews.profile`

- 当前值：`assertive`
- 作用：审查风格更严格，问题反馈更密集、更加“挑细节”。

#### `reviews.request_changes_workflow`

- 当前值：`true`
- 作用：在发现关键问题时可走“Request changes”流程，强化合并门禁。

### 审查输出内容

#### `reviews.high_level_summary`

- 当前值：`true`
- 作用：生成 PR 高层摘要（变更概览）。

#### `reviews.high_level_summary_placeholder`

- 当前值：`@coderabbitai summary`
- 作用：在 PR 描述中定位/替换摘要插槽。

#### `reviews.high_level_summary_in_walkthrough`

- 当前值：`true`
- 作用：将高层摘要也放入 walkthrough 评论中。

#### `reviews.auto_title_placeholder`

- 当前值：`@coderabbitai`
- 作用：用于触发/占位自动 PR 标题生成机制。

#### `reviews.review_status`

- 当前值：`true`
- 作用：展示审查状态信息（如跳过、完成、进行中）。

#### `reviews.review_details`

- 当前值：`true`
- 作用：展示更多审查细节（如忽略信息、额外上下文等）。

#### `reviews.commit_status`

- 当前值：`true`
- 作用：在 Git 提交状态中标记审查进行中/完成状态。

#### `reviews.fail_commit_status`

- 当前值：`true`
- 作用：当 CodeRabbit 无法完成审查时，将提交状态标记为失败。

#### `reviews.collapse_walkthrough`

- 当前值：`false`
- 作用：控制 walkthrough 是否默认折叠；`false` 表示默认展开。

#### `reviews.changed_files_summary`

- 当前值：`true`
- 作用：在 walkthrough 中展示变更文件摘要。

#### `reviews.sequence_diagrams`

- 当前值：`true`
- 作用：允许在 walkthrough 中生成时序图（适用于流程类改动）。

#### `reviews.assess_linked_issues`

- 当前值：`true`
- 作用：评估 PR 对关联 Issue 的解决程度。

#### `reviews.related_issues`

- 当前值：`true`
- 作用：补充可能相关的 Issue 线索。

#### `reviews.related_prs`

- 当前值：`true`
- 作用：补充可能相关的 PR 线索。

#### `reviews.suggested_labels`

- 当前值：`true`
- 作用：让 CodeRabbit 根据变更建议标签。

#### `reviews.auto_apply_labels`

- 当前值：`true`
- 作用：自动应用建议标签（受平台权限和规则影响）。

#### `reviews.suggested_reviewers`

- 当前值：`true`
- 作用：根据改动范围建议评审人。

#### `reviews.poem`

- 当前值：`true`
- 作用：在 walkthrough 中附带诗歌内容（趣味项）。

#### `reviews.abort_on_close`

- 当前值：`true`
- 作用：PR 关闭/合并后中止进行中的审查任务。

### 标签建议规则

#### `reviews.labeling_instructions`

- 类型：数组
- 作用：定义“可建议标签”和“触发条件说明”。

##### `reviews.labeling_instructions[].label`

- 作用：标签名（如 `bug`、`security`）。

##### `reviews.labeling_instructions[].instructions`

- 作用：该标签的适用规则描述，指导 CodeRabbit 何时建议此标签。

### 路径级审查规则

#### `reviews.path_instructions`

- 类型：数组
- 作用：对不同路径应用不同审查关注点（按 glob 匹配）。

##### `reviews.path_instructions[].path`

- 作用：路径匹配模式（如 `src/02-security/**`）。

##### `reviews.path_instructions[].instructions`

- 作用：该路径下的专项审查指令（例如安全、性能、边界条件等）。

### 自动审查设置

#### `reviews.auto_review`

- 作用：自动触发审查的行为配置。

##### `reviews.auto_review.enabled`

- 当前值：`true`
- 作用：开启自动审查。

##### `reviews.auto_review.incremental`

- 当前值：`true`
- 作用：每次增量提交（push）后重新执行审查。

##### `reviews.auto_review.auto_incremental_review_pause_after`

- 当前值：`10`
- 作用：连续增量审查达到设定次数后自动暂停，避免过于频繁。

##### `reviews.auto_review.drafts`

- 当前值：`true`
- 作用：Draft PR 也执行自动审查。

##### `reviews.auto_review.base_branches`

- 当前值：`["main", "master"]`
- 作用：限定自动审查适用的目标基线分支。

### Finishing Touches（自动补全增强）

#### `reviews.finishing_touches`

- 作用：配置 CodeRabbit 的后处理增强能力（如文档字符串、单测生成）。

##### `reviews.finishing_touches.docstrings.enabled`

- 当前值：`true`
- 作用：开启文档字符串生成/补全能力。

##### `reviews.finishing_touches.unit_tests.enabled`

- 当前值：`true`
- 作用：开启单元测试生成能力。

### `reviews.pre_merge_checks`（合并前检查）

#### `reviews.pre_merge_checks.docstrings.mode`

- 当前值：`warning`
- 作用：文档字符串覆盖率检查的执行级别（仅警告，不阻塞）。

#### `reviews.pre_merge_checks.docstrings.threshold`

- 当前值：`70`
- 作用：文档字符串覆盖率阈值（百分比）。

#### `reviews.pre_merge_checks.title.mode`

- 当前值：`error`
- 作用：PR 标题检查级别；`error` 通常会阻断合并。

#### `reviews.pre_merge_checks.title.requirements`

- 当前值：`PR 标题应简洁描述变更目的...`
- 作用：标题规范说明，作为检查标准。

#### `reviews.pre_merge_checks.description.mode`

- 当前值：`warning`
- 作用：PR 描述质量检查级别。

#### `reviews.pre_merge_checks.issue_assessment.mode`

- 当前值：`warning`
- 作用：关联 Issue 处理充分性检查级别。

#### `reviews.pre_merge_checks.custom_checks`

- 类型：数组
- 作用：定义自定义合并前检查项。

##### `reviews.pre_merge_checks.custom_checks[].name`

- 作用：检查项名称（展示用）。

##### `reviews.pre_merge_checks.custom_checks[].mode`

- 作用：检查级别（`off` / `warning` / `error`）。

##### `reviews.pre_merge_checks.custom_checks[].instructions`

- 作用：该检查的判定规则与执行说明（决定 pass/fail 依据）。

### `reviews.tools`（工具集成）

- 作用：为审查提供外部静态分析工具支持。

#### 通用结构

- 多数工具使用：
  - `<tool>.enabled: true|false` 控制是否启用。

#### 已配置工具字段

- `reviews.tools.eslint.enabled`：启用 ESLint（JS/TS 规则检查）。
- `reviews.tools.biome.enabled`：启用 Biome（格式化/检查）。
- `reviews.tools.gitleaks.enabled`：启用 Gitleaks（敏感信息泄漏检测）。
- `reviews.tools.trufflehog.enabled`：启用 TruffleHog（密钥检测/验证）。
- `reviews.tools.shellcheck.enabled`：启用 ShellCheck（Shell 脚本检查）。
- `reviews.tools.hadolint.enabled`：启用 Hadolint（Dockerfile 检查）。
- `reviews.tools.markdownlint.enabled`：启用 Markdownlint（Markdown 规范检查）。
- `reviews.tools.languagetool.enabled`：启用 LanguageTool（语言风格检查）。
- `reviews.tools.languagetool.level`：语言检查级别，`picky` 更严格。
- `reviews.tools.yamllint.enabled`：启用 YAMLlint（YAML 规范检查）。
- `reviews.tools.actionlint.enabled`：启用 actionlint（GitHub Actions 工作流检查）。
- `reviews.tools.semgrep.enabled`：启用 Semgrep（通用静态分析/安全规则）。
- `reviews.tools.opengrep.enabled`：启用 OpenGrep（高性能规则扫描）。
- `reviews.tools.ast-grep.essentials`：启用 ast-grep 的内置 essentials 规则集。
- `reviews.tools.github-checks.enabled`：启用 GitHub Checks 集成。
- `reviews.tools.github-checks.timeout_ms`：等待 GitHub Checks 完成的超时时间（毫秒）。

---

## `chat`（交互配置）

### `chat.auto_reply`

- 当前值：`true`
- 作用：允许 CodeRabbit 在合适场景自动回复，不必每次都手动 @。

---

## `knowledge_base`（知识库与上下文来源）

### `knowledge_base.opt_out`

- 当前值：`false`
- 作用：是否退出知识库功能；`false` 表示启用相关能力。

### `knowledge_base.web_search.enabled`

- 当前值：`true`
- 作用：允许使用 Web 搜索补充审查上下文。

### `knowledge_base.learnings.scope`

- 当前值：`auto`
- 作用：学习记忆范围策略（自动判定本地/组织级）。

### `knowledge_base.issues.scope`

- 当前值：`auto`
- 作用：Issue 上下文检索范围策略。

### `knowledge_base.pull_requests.scope`

- 当前值：`auto`
- 作用：历史 PR 上下文检索范围策略。

---

## `code_generation`（代码生成配置）

### `code_generation.docstrings.language`

- 当前值：`zh-CN`
- 作用：文档字符串生成语言。

### `code_generation.docstrings.path_instructions`

- 作用：针对特定路径设置文档生成规则。

#### `code_generation.docstrings.path_instructions[].path`

- 作用：目标路径匹配模式（如 `src/**/*.js`）。

#### `code_generation.docstrings.path_instructions[].instructions`

- 作用：该路径下文档字符串生成规范（如强制 JSDoc 标签）。

### `code_generation.unit_tests.path_instructions`

- 作用：针对特定路径设置单测生成规则。

#### `code_generation.unit_tests.path_instructions[].path`

- 作用：目标路径匹配模式。

#### `code_generation.unit_tests.path_instructions[].instructions`

- 作用：该路径下单测生成规范（如使用 Jest，覆盖边界/异常流程）。

---

## 补充说明

- 文档按“当前配置文件中出现的字段”逐项解释，便于你对照维护。
- 如果后续 `.coderabbit.yaml` 字段有增删，建议同步更新本文档，保证一致性。
