# Acme Widgets — Agent Guide

> Canonical context for AI coding agents on this repo. Edit this file, then run
> `agentmirror sync`. Keep it lean — every line must earn its place.

## Project

Acme Widgets is a small TypeScript library for formatting widget part numbers.

## Setup

- Install: `npm install`
- Build: `npm run build`
- Test: `npm test`

## Conventions

- Source lives in `src/`; tests sit next to the code they cover.
- Public API is re-exported from `src/index.ts` — keep it the only entry point.

## Do / Don't

- **Do:** add a test with every behavior change.
- **Don't:** edit the generated mirror files (`CLAUDE.md`, etc.) by hand.
