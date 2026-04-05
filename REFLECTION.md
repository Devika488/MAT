# Reflection
## What I built
This project is a vertical slice of an Ayurveda retreat discovery and booking platform, covering both user and operator workflows. The backend exposes endpoints for retreat listing with filters and pagination, AI-powered recommendations based on health goals, real-time availability checks, booking creation and cancellation, and an admin view. The frontend supports discovery, booking, and operator management, with transactional emails sent on booking confirmation and cancellation.

## The decision I'm most glad I made

The most important decision I made was correcting the availability model. I initially designed it around room types, but realised this didn’t reflect the domain. Ayurveda retreats sell treatment capacity, not rooms. I refactored to a capacity-based model where availability is determined by overlapping bookings against a fixed limit. This simplified the schema and aligned it with real-world constraints.

## Architecture decisions

Correctness under concurrency was a key focus. I implemented a two-layer availability check—frontend for UX and backend for enforcement. To prevent race conditions, I used SELECT FOR UPDATE to lock the retreat row before checking conflicts. Locking the retreat (instead of bookings) ensures correctness even when no prior bookings exist. I also used soft deletes for cancellations to preserve audit history.

## Task 3 — what I added and why

For Task 3, I added an AI-powered recommendation endpoint. Ayurveda users typically think in terms of health goals rather than treatment names, so mapping natural language input to relevant retreats improves discoverability. I also added Zod validation and rate limiting to the booking endpoint, since it handles personal data and financial intent, and built an admin interface with cancellation to complete the operator workflow.

## How I used AI

I used AI tools like ChatGPT and Claude mainly for architectural exploration and scaffolding. All business logic, validation, and database decisions were implemented by me. I also overrode an initial suggestion to lock booking rows, choosing instead to lock the retreat row for correctness.

## What I would do with more time

With more time, I would introduce a program-level model within retreats, add user-facing booking history and cancellation, implement proper operator authentication, and expand test coverage to include AI fallbacks and email side effects.