/**
 * Formats emergency service title with standard fallback.
 */
export function formatEmergencyTitle(service: string): string {
  if (!service) {
    return "Emergency Services";
  }
  return `${service.trim()} - Emergency`;
}
