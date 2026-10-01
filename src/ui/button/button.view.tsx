import { type JSX, type ParentProps, splitProps } from "solid-js";
import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ParentProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ["variant", "class", "children"]);
  const classes = () =>
    [styles.button, styles[local.variant ?? "primary"], local.class].filter(Boolean).join(" ");

  return (
    <button {...others} type={others.type ?? "button"} class={classes()}>
      {local.children}
    </button>
  );
}

export default Button;
