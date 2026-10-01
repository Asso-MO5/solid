import { createUniqueId, type JSX, type ParentProps, splitProps } from "solid-js";
import styles from "./field.module.css";

interface FieldProps extends ParentProps<JSX.InputHTMLAttributes<HTMLInputElement>> {
  label: string;
  hint?: string;
  error?: string;
}

export function Field(props: FieldProps) {
  const [local, others] = splitProps(props, ["label", "hint", "error", "class"]);
  const inputId = createUniqueId();
  const messageId = createUniqueId();

  return (
    <div class={styles.field}>
      <label class={styles.label} for={inputId}>
        {local.label}
      </label>
      <input
        {...others}
        id={inputId}
        class={styles.input}
        aria-invalid={local.error ? "true" : undefined}
        aria-describedby={local.hint || local.error ? messageId : undefined}
      />
      {local.error ? (
        <p id={messageId} class={styles.error} role="alert">
          {local.error}
        </p>
      ) : local.hint ? (
        <p id={messageId} class={styles.hint}>
          {local.hint}
        </p>
      ) : undefined}
    </div>
  );
}

export default Field;
