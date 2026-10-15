"use client";

import { useFormStatus } from "react-dom";
import { loginAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const ERROR_MESSAGES = {
  password: "Incorrect password.",
  unconfigured: "Admin sign-in is disabled until ADMIN_PASSWORD is set on the server.",
} as const;

export type LoginError = keyof typeof ERROR_MESSAGES;

interface LoginFormProps {
  error?: LoginError;
}

export function LoginForm({ error }: LoginFormProps) {
  return (
    <form action={loginAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
        >
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="h-12 rounded-full border-foreground bg-background px-5 shadow-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">{ERROR_MESSAGES[error]}</p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="group mt-2 h-12 rounded-full">
      {pending ? (
        <>
          <Spinner />
          Signing in…
        </>
      ) : (
        <>
          Sign in
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </>
      )}
    </Button>
  );
}
