# PRD – Seiling Auditor

## Summary
AI-assisted static analysis for Sei smart contracts with batch audits and detailed reports.

## Users
- Smart contract developers and protocol teams

## Goals & Metrics
- 90% vuln detection on supported categories
- Batch auditing with webhook status updates

## Functional Requirements (MVP)
- Upload contract source or address
- Run static analyzers (Slither/Mythril) in containers
- Generate AI-augmented report with CWE/SWC mapping

## Architecture
- Next.js + Prisma + API routes
- Workers for analyzer jobs (queue later)
- SeiScan/Sei RPC client for Sei blockchain integration

## Milestones
- M1: UI skeleton + endpoint stubs
- M2: Static analyzer integration
- M3: Reports with SWC/CWE links and export

