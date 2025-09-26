import { useAuth } from "@solid-mediakit/auth/client";

export const AuthSignin = () => {
  const auth = useAuth()
  return <button
    onClick={() => auth.signIn("discord", { redirectTo: "/" })}
    class="btn"
  >
    Se connecter
  </button>
}