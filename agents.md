# Global Agent Rules & Guidelines

## ⚠️ Feature Impact Analysis
Before adding any new feature, the agent must perform the following analysis and present it to the user:
1. **Dependency Analysis**: Check for new packages or scripts introduced.
2. **Files Affected**: List exact file paths to be created, modified, or deleted.
3. **APIs Affected**: List frontend routes, server endpoints, and third-party API configurations.
4. **Database Impact**: List schema tables, migrations, indexes, or JSON column adjustments.
5. **Bundle Size Estimation**: Estimate frontend impact.
6. **AI Token Usage Estimation**: Estimate Gemini/OpenAI token footprint.
7. **Security Impact**: Review authentication (JWT, OAuth) and rate limiter rules.
8. **Performance Impact**: Review database indexing, Redis caching, and timeouts.
9. **Regression Risk**: Assess likelihood of breaking existing working modules (UI/UX, voice assessment, PWA).

> [!IMPORTANT]
> If risk is above **LOW**, **STOP** and ask for user approval. Do not modify codebase files until the analysis is presented.

---

## 🛠️ Code Conventions & Design Aesthetics
* **Design System**: Use tokens in `client/src/styles/tokens.css` for pages and dialogs.
  * *Exception*: AuthPage.css and AdminDashboard.css are permanently excluded.
* **Component Styling**: Always leverage the pre-defined tokens instead of using inline or ad-hoc custom styles.
* **Accessibility (Aria)**: Keep focus traps in all modal overlays, utilizing the `useFocusTrap` hook. Add corresponding ARIA labels.
* **Git & Workflow**: All testing and deduplication fixes happen locally. Pushes to GitHub and Railway deployment are done only after the entire phase is complete.
