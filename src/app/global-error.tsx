// Report root React failures and let visitors retry without exposing technical details.
"use client";

import { captureException } from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);
  return (
    <html lang="de">
      <body>
        <h1>Ein Fehler ist aufgetreten.</h1>
        <button onClick={reset}>Erneut versuchen</button>
      </body>
    </html>
  );
}
