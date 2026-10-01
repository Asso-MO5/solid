/**
 * Environment variable access, server-side only.
 * Fails early with a French message when a required variable is missing.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  get ocelotApiUrl(): string {
    return required("OCLOT_API_URL");
  },
  get ocelotApiKey(): string | undefined {
    return process.env.OCLOT_API_KEY;
  },
};
