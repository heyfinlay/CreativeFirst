"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  label: string;
  loadingLabel?: string;
  className?: string;
};

export default function FormSubmitButton({
  label,
  loadingLabel = "Saving...",
  className,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
