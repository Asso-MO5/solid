import { useAuth } from "@solid-mediakit/auth/client";

export const AuthSignout = () => {
  const auth = useAuth()

  return <button
    onClick={() => auth.signOut({ redirectTo: "/" })}
    class="headless text-sm text-secondary hover:text-accent p-0 cursor-pointer"
  >
    Se déconnecter
  </button>
}