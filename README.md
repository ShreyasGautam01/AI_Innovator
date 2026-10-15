# AI Native Innovator — Interest Landing Page

Responsive recruitment landing page for the AI Native Innovator opportunity at Future University, Mohali. Built with semantic HTML, CSS, and vanilla JavaScript. Candidate interest submissions are stored in Supabase Postgres.

## Features
- Responsive editorial landing page with sections explaining the opportunity, working approach, and candidate fit.
- Required full name, email, phone, LinkedIn/portfolio URL, current position, fit statement, and consent.
- Field-level validation, status/error/success messages, request timeout, and double-submit prevention.
- Lightweight honeypot and database-level case-insensitive unique email index.
- Row Level Security: public visitors can insert candidate submissions but cannot read, update, or delete records.
- GitHub Actions workflow for publishing the static site to GitHub Pages.

## Supabase
Project URL and the **publishable** API key are configured in `config.js`. A publishable key is intended for public client apps. Never put a Supabase secret or service-role key in this repository.

Table: `public.innovator_interest_submissions`. The schema is tracked in `supabase/migrations/20261015000000_create_innovator_interest_submissions.sql` and has already been applied to the connected project. Do not rerun it on that project.

Inspect submissions through Supabase Dashboard → Table Editor. The public web client is not allowed to list/read candidate records.

## Deploy to GitHub Pages
1. Open repository **Settings → Pages** and choose **GitHub Actions** as the deployment source.
2. The workflow runs on each push to `main`, or can be launched manually from **Actions**.
3. Wait for the deployment job to succeed, then open its published URL.
4. Test in a private browser window and confirm a submission appears in Supabase.

## Release checks
- Submit a complete test candidate and verify one row appears.
- Resubmit using the same email and confirm the duplicate is rejected.
- Test missing fields, malformed email, phone, and URL.
- Confirm public visitors cannot select from the submissions table.
- Check keyboard navigation and mobile layouts.

## Production hardening
The honeypot is only a basic spam deterrent. Before high-volume public use, add server-verified anti-abuse/rate limiting, finalize a candidate data retention/deletion policy, and review privacy requirements. Email alerts and resume uploads are intentionally not included in the core sprint.
