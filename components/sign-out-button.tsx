export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="text-sm text-haze underline-offset-4 transition hover:text-paper hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}
