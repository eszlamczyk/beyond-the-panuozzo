/**
 * Represents the identity performing an action in the domain.
 *
 * The Actor is a pure domain concept — it carries no framework dependencies.
 * Controllers (adapters) are responsible for mapping framework-specific
 * principals (e.g. JWT payloads) into an Actor before calling domain services.
 */
export class Actor {
  constructor(readonly userId: string) {}

  isOwnerOf(resource: { userId: string }): boolean {
    return this.userId === resource.userId;
  }
}
