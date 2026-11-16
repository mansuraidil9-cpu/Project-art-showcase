"use client";
import { useActionState, useEffect } from "react";

const initial = { success: false, message: "", fields: {}, values: {} };

export default function useActionForm(action) {
  const [state, formAction, pending] = useActionState(action, initial);
  useEffect(() => {
    if (state.success && state.redirectTo) window.location.assign(state.redirectTo);
  }, [state]);
  return [state, formAction, pending || Boolean(state.redirectTo)];
}
