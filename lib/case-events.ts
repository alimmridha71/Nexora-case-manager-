// Shared (non-server-action) constants for the case timeline.
export const EVENT_TYPES = ['filing', 'hearing', 'order', 'document', 'status', 'note'] as const;
export type EventType = (typeof EVENT_TYPES)[number];
