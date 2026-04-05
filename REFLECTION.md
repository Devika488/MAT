# Reflection

## What I built

This is a vertical slice of an Ayurveda retreat discovery and booking platform.

The backend exposes seven endpoints covering retreat listing with filtering and pagination, AI-powered recommendations based on health goals, real-time availability checks, booking creation and cancellation, and an operator-facing admin view.

The frontend supports the full user journey—from discovery to retreat details and booking—as well as an admin interface for operators to manage bookings.

Both booking confirmation and cancellation trigger transactional emails to the traveller, ensuring clear communication and trust for high-value bookings.

## The decision I'm most glad I made

I initially modeled availability at the room-type level, with one row per variant and conflict checks scoped to a specific room. Midway through development, I realized this didn’t align with the domain.

In Ayurveda retreats, what’s sold is treatment capacity, not physical rooms. A program like Panchakarma accommodates a fixed number of guests regardless of room allocation. The real constraint is total occupancy against a capacity limit, not room identity.

I refactored the model to a single row per retreat with a capacity field, and redefined availability as the count of confirmed bookings over overlapping dates compared against that capacity.

This simplified the schema and aligned the system with the real-world model. It’s a good example of catching a domain modeling mistake early—something that would have been costly to correct in production.

## Architecture decisions

**Two-layer availability.** Availability is checked on the detail page as soon as dates are selected, so users immediately see whether a room is available before entering any personal details. This improves UX and reduces unnecessary form submissions.
The /bookings endpoint independently rechecks availability on the server for every request. The frontend layer is for user experience; the backend layer guarantees correctness. Both are required.

**Race condition handling.** A simple availability check is not sufficient under concurrency—two requests can pass the check before either commits, resulting in double booking.
To prevent this, I use SELECT FOR UPDATE to lock the retreat row before performing the conflict check. This serialises concurrent booking attempts.

The lock is applied to the retreat row rather than bookings because booking rows may not exist when a room is initially empty, making them ineffective for locking. With this approach, one request succeeds while the other receives a 409 Conflict.

**Soft delete for cancellations.** The DELETE /bookings/:id endpoint marks a booking as cancelled instead of removing it. This preserves audit history—operators need to know that a booking existed and was later cancelled.
The endpoint remains a DELETE to align with REST semantics, while the underlying implementation uses a soft delete strategy.

**Transactional emails.** Booking confirmations and cancellations both trigger email notifications to the traveller. For high-value bookings, lack of confirmation creates uncertainty and erodes trust.
Email serves as a minimal but essential feedback mechanism to confirm that an action has been successfully processed.

## Task 3 — what I added and why

I treated availability correctness as the core of the system because in a booking domain, correctness is non-negotiable — a double booking on a high-value Panchakarma program would be a serious trust failure for both the operator and the guest. That’s why I made the availability check and concurrency handling the centerpiece of the design.

On top of that, I added an AI-powered recommendation endpoint to solve the actual discovery problem. In Ayurveda, users typically know their health concern, not the treatment terminology. So mapping natural language inputs like ‘stress’ or ‘digestive issues’ to relevant retreats makes the system more user-centric.

I also implemented Zod validation and rate limiting on the booking endpoint because it handles personal data and signals financial intent — it requires stricter guarantees than a basic validation layer.

Finally, I included an admin view with cancellation capability to complete the operator workflow. A system that allows viewing bookings without acting on them would be incomplete, so I ensured the operator side is functional as well.

## How I used AI

I used AI tools like ChatGPT and Claude primarily during the planning phase to validate architectural decisions and explore different approaches. For implementation, I worked iteratively—building the system phase by phase.

While AI helped generate scaffolding (like the Express setup and seed data), all core business logic, validation, and database design decisions were written and owned by me.

For example, during concurrency handling, the initial suggestion was to use SELECT FOR UPDATE on bookings. I deliberately changed that approach to lock the retreat row instead, because booking rows may not exist when a retreat has no prior bookings—making the original lock ineffective in the exact scenario it’s meant to handle.

Testing was automated using AI-assisted tools after development, but I ensured the test scenarios reflect real-world booking constraints and edge cases.

## What I would do with more time

If I were to extend this further, I’d focus on evolving the data model and completing the user and operator workflows.

First, I would introduce a program-level model within each retreat. Instead of a single capacity at the retreat level, each program would have its own schedule, duration, and capacity. This better reflects how real-world Ayurveda retreats operate, where multiple programs run in parallel with different constraints.

Second, I’d add a seeker-facing booking history so users can view and manage their own reservations, including cancellations, without relying on an operator. This completes the user-side journey.

Third, I’d implement proper operator authentication and authorization. The current admin view would be scoped to the logged-in operator, ensuring they can only access and manage their own retreats.

Finally, I’d expand test coverage to include AI recommendation fallbacks and external side effects like email notifications, ensuring reliability beyond the core booking flow.