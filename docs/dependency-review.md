# Dependency security review — PR #12

Reviewed: 2026-09-23. Branch: `fix/p0-security-hardening`. Scope: the seven remaining backend production-dependency audit entries only.

## Result and decision

**0 resolved in this follow-up; 7 remain (1 critical, 1 high, 5 moderate).**
These are seven affected-package entries, not seven independent CVEs: several entries propagate advisories from the same transitive packages.

The previous P0 commit already applied compatible patches. A fresh `npm audit --omit=dev --json`, installed dependency tree, npm registry version/range checks and `npm audit fix --dry-run --ignore-scripts --json` were reviewed. The dry run proposes **0 additions, 0 removals and 0 changes**. No remaining fix was established as compatible and low risk within the declared dependency ranges. Consequently no manifest, lockfile, application code or dependency override was changed. No force update was performed.

## Package-by-package assessment

| Affected package (installed) | Severity | Direct/transitive and introduction chain | Exposure in this application | Compatible low-risk fix / decision |
|---|---|---|---|---|
| `tar@6.2.1` | Critical | Transitive: `argon2@0.31.2 → @mapbox/node-pre-gyp@1.0.11 → tar` | Primarily native-binary installation/archive extraction. No application archive-processing route or direct tar call was found. Presence in production dependencies does not make every advisory reachable from HTTP. | No. Installer requires `tar ^6.1.11`; 6.2.1 is the latest 6.x. The latest reported affected range extends through 7.5.20; 7.5.22 is available, but crossing to 7.x via override violates the installer's range. Deferred. |
| `@mapbox/node-pre-gyp@1.0.11` | High | Transitive: `argon2@0.31.2 → @mapbox/node-pre-gyp` | Installation tooling. Argon2 also loads its `find()` helper at runtime to locate the native binding; this is not archive extraction during login. Audit entry is inherited from tar. | No. Argon2 requires `^1.0.11`; 2.0.3 uses tar 7.x and requires Node >=18. Forcing this major under Argon2 would replace unsupported installer behavior. Deferred with tar. |
| `mssql@9.3.3` | Moderate | **Direct** application dependency; inherits the Tedious/Azure findings. | SQL runtime dependency used throughout models and authentication. The affected Azure credential flow is not configured: application sets `authentication.type = 'default'` with SQL username/password. | No. Latest 9.x is already installed. Audit recommends 12.7.2, outside `^9.0.1`. Requires SQL integration and compatibility review. |
| `tedious@15.1.3` | Moderate | Transitive: `mssql@9.3.3 → tedious` | Runtime SQL driver; inherits Azure Identity findings. SQL authentication does not establish Azure credential-flow exposure. | No within the current driver chain. Tedious 15.1.3 requires Identity `^2.0.4`. Future mssql 12.7.2 accepts Tedious `^19.2.2 || ^20.0.0`; do not override that driver beneath mssql 9. |
| `@azure/identity@2.1.0` | Moderate | Transitive: `mssql → tedious → @azure/identity` | Runtime Azure credential functionality packaged with the SQL driver; not selected by the application's SQL-auth configuration. Own advisory concerns elevation of privilege in credential/token handling, plus inherited uuid/MSAL findings. | No. Own advisory first patched in 4.2.1, outside `^2.0.4`. That minimum alone does not fix all inherited reports. Identity 4.13.1 no longer directly depends on uuid and permits MSAL 5.x. Resolve through a supported SQL-driver upgrade, then re-audit. |
| `@azure/msal-node@1.18.4` | Moderate | Transitive: `mssql → tedious → @azure/identity → @azure/msal-node` | Runtime Azure authentication library; audit entry inherited from uuid. Inspected installed code uses `uuid.v4()`, not the functions in this advisory. | No. Identity 2.1.0 requests `^1.10.0`; audit affected range is <=5.1.4. Registry MSAL 5.1.5 no longer lists uuid. A supported Identity/driver update is needed, not a standalone major override. |
| `uuid@8.3.2` | Moderate | Transitive, shared by Identity and MSAL under `mssql → tedious` | Runtime library. Advisory targets v3/v5/v6 with caller-supplied buffers. Inspected Identity/MSAL call sites use v4; no direct application uuid call was found. This reduces demonstrated reachability, but does not remove the vulnerable installed package. | No. Both parents request uuid 8.x; patch starts at 11.1.1. Do not force a multi-major replacement under those parents. Upgrade the supported SQL chain or remove its uuid dependency via upstream releases. |

Reachability statements are static-review conclusions, not proof that exploitation is impossible. Dependencies remain counted and no advisory was suppressed.

## Deferred upgrade paths

### Argon2 / installer / tar

Evaluate a supported newer Argon2 release that ships native prebuilds and uses `node-gyp-build` instead of node-pre-gyp. Registry `argon2@0.45.1` has that structure, but it is outside `^0.31.1`; upstream release notes also drop tested support for Node 18/20. Argon2 is pre-1.0, so a minor-line jump must not be treated as automatically compatible. The native distribution changed in the 0.40 release line.

A future change should choose a supported Node/platform matrix, verify existing stored hashes, registration/login and clean installation on deployment OS/architecture. Alternatively an upstream supported installer release would need tar >7.5.20. No such fix exists inside the current declared ranges. The v0.40.0 GitHub release exists, but that exact version returned E404 from npm during this review; it is not a proposed install target.

### SQL / Azure / uuid

Audit proposes `mssql@12.7.2` (Node >=18.19.0), which moves the driver to Tedious 19/20. Verify driver migration notes, connection/TLS/authentication behavior, stored procedures, parameter types, transactions and pooling against a real SQL Server before selecting a final version and lockfile. A fresh resolved tree must clear both Azure Identity and uuid reports; merely upgrading Identity to its first own-advisory patch is insufficient.

The current MSAL 1.18.4 engine range excludes local Node 25.2.1; npm reports this warning. Passing local tests with SQL doubles does not establish driver compatibility or justify forcing an update.

## Validation

Repeated on 2026-09-23 using Node 25.2.1 / npm 11.6.2:

| Check | Result |
|---|---|
| Backend `npm test` | PASS: 25 tests, 0 failures |
| Frontend `npm run build` | PASS with the same existing ESLint/Browserslist warnings; output main.d23a6af5.js and main.2b1caee2.css match P0 |
| Grafana `docker compose --env-file grafana/.env.example -f grafana/docker-compose.grafana.yml config --quiet` | PASS (isolated empty Docker CLI config; no services started) |
| SQL credential/TLS, production CORS, session lifetime configuration | PASS within backend configuration tests |
| Backend JavaScript syntax | PASS: 46 files |
| Historical-value scan against pre-P0 commit e8a9baea397d4092a2ee0400bfb94bb4edb2d553 | PASS: four known values, no matches in current files |
| `git diff --check` | PASS |
| Compatible-fix dry run | 0 added / removed / changed; seven package findings retained |

No regressions were detected in these checks. This follow-up changes documentation/evidence only; package manifests, lockfiles and application code are unchanged. Tests use real HTTP/Express/Argon2 with SQL/model doubles; live SQL Server and Grafana were not validated. Passing these checks does not clear the dependency advisories or establish production readiness.

## Sources and evidence

- npm registry metadata and lockfile: installed versions/ranges above; production audit snapshot in [dependency-audit-2026-09-23.json](dependency-audit-2026-09-23.json).
- [Argon2 0.40 native-distribution change](https://github.com/ranisalt/node-argon2/releases/tag/v0.40.0).
- [Argon2 release history / Node support](https://github.com/ranisalt/node-argon2/releases).
- [node-pre-gyp 2.0.0](https://github.com/mapbox/node-pre-gyp/releases/tag/v2.0.0).
- [mssql releases](https://github.com/tediousjs/node-mssql/releases).
- [Azure Identity advisory](https://github.com/advisories/GHSA-m5vv-6r4h-3vj9).
- [uuid advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
- [tar unlimited-input advisory](https://github.com/advisories/GHSA-23hp-3jrh-7fpw).
- [tar recursive-filter advisory](https://github.com/advisories/GHSA-r292-9mhp-454m).
- The audit snapshot includes all 12 tar advisory links and affected ranges, including traversal, parser and denial-of-service issues.
