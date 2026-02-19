export function formatPrice(grosze: number): string {
  return `${(grosze / 100).toFixed(2)} zł`;
}
