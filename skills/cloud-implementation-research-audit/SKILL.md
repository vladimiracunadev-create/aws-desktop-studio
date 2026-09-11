---
name: cloud-implementation-research-audit
description: Investigate and audit whether a cloud-integrated repository's claimed capabilities are actually implemented, secure, current, and evidenced. Use for serious web research comparing code, docs, releases, and UI claims against official AWS, Azure, Google Cloud, or other provider documentation; authentication and credential chains; open-source references and licenses; deployment maturity; and end-to-end acceptance criteria. Do not use for ordinary code edits without a cloud implementation or evidence question.
---

# Cloud Implementation Research Audit

Produce an evidence-first assessment that distinguishes a working implementation from a prototype, deployment artifact, simulated environment, or documented intention. Keep the method provider-neutral and specialize only after identifying the cloud and runtime in scope.

## Operating principles

- Treat repository code, tests, workflows, release artifacts, and remote metadata as separate sources of truth.
- Separate current-state markers from historical references. Correct stale current claims; preserve accurate history.
- Prefer primary sources: official provider documentation, SDK/CLI references, security guidance, changelogs, and the exact upstream repositories being compared.
- Record access dates and version prerequisites for facts likely to change.
- Never equate a successful build, green CI, localhost UI, installer, or browser console session with validated programmatic cloud access.
- Never request, copy, log, publish, or place into fixtures passwords, MFA codes, access keys, session tokens, account identifiers, private ARNs, or ephemeral OAuth URLs.
- Do not mutate cloud resources, repository metadata, releases, or branches unless the user explicitly authorizes that change.

## Audit workflow

1. Inventory the repository before browsing: manifests, application entry points, authentication code, provider chain, tests, workflows, security policy, docs, tags, releases, and public metadata.
2. Extract concrete product claims and classify each as `implemented`, `partially implemented`, `documentation only`, `aspirational`, or `contradicted`.
3. Identify the security boundary. Distinguish browser-console authentication from programmatic credentials and map every supported provider, cache, refresh, logout, and failure path.
4. Research the relevant provider using official sources first. Verify current CLI/SDK versions, permission requirements, credential precedence, regional or partition differences, expiration semantics, and recovery behavior.
5. Compare mature open-source products for architectural patterns, not superficial screenshots. Record the exact repository, relevant component, maintenance status, and license. Do not copy code until the applicable license is verified.
6. Threat-model secret handling, least privilege, root/owner identities, local servers, IPC, logs, caches, command execution, dependency supply chain, artifact signing, updates, and rollback.
7. Audit discovery claims. Check pagination, regional/global scope, multi-account aggregation, eventual consistency, unsupported resource types, permission-denied states, costs, and distinctions between inventory, configuration, and billing data.
8. Build a gap matrix with repository evidence, authoritative expectation, risk, and a testable remedy. Prioritize as P0 identity/security, P1 functional completeness, and P2 distribution/operations unless the project requires a stricter scheme.
9. Define reproducible E2E acceptance criteria using sandbox identities and synthetic fixtures. Include success, cancellation, expiration, renewal, logout, network failure, denied permissions, wrong region/tenant/project, and stale credential precedence.
10. Produce a cited Markdown report and update product wording only when authorized. State limitations plainly and identify which conclusions are direct evidence versus inference.

## Provider routing

- For AWS, inspect standardized credential providers, IAM/STS, IAM Identity Center, AWS CLI, regions/partitions, Resource Explorer, Config, Organizations, and service-specific APIs.
- For Azure, inspect Azure Identity credential chains, Entra ID, subscriptions/tenants, Azure CLI, Resource Graph, RBAC, managed identities, and sovereign clouds.
- For Google Cloud, inspect Application Default Credentials, Workforce/Workload Identity Federation, projects/organizations, gcloud, Cloud Asset Inventory, IAM, and regional constraints.
- For another provider, first locate its official authentication, SDK/CLI, resource inventory, IAM, audit logging, and security lifecycle documentation; then apply the same evidence matrix.

## Required report structure

1. Executive conclusion and explicit maturity label.
2. Scope, date, versions, and method.
3. Claim-versus-evidence matrix.
4. Authentication and credential lifecycle.
5. Security and threat model.
6. Resource discovery and operational semantics.
7. Comparable open-source implementations and license constraints.
8. Verified repository history versus unreleased changes.
9. Target architecture and prioritized plan.
10. E2E acceptance matrix and release gates.
11. Direct links to primary sources.

## Verification before delivery

- Run the repository's relevant unit, integration, lint, workflow, dependency, encoding, and packaging checks in proportion to the claims being changed.
- Search the final diff for secrets, personal identifiers, stale versions, unsupported counts, and language that overstates maturity.
- Confirm every external comparison has a source and every reusable component has a verified license.
- Report commands and outcomes precisely. A failed or unexecuted E2E test must remain an explicit gap.
