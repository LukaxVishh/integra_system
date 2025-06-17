export function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  return parts[0] || fullName;
}

export function getFirstAndSecondName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return fullName;
}
