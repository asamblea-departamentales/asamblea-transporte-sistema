import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FocusTrap } from "./FocusTrap";

describe("FocusTrap", () => {
  it("enfoca el primer control, cicla Tab y restaura el foco", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(
      <FocusTrap>
        <button type="button">Primero</button>
        <button type="button">Último</button>
      </FocusTrap>,
    );
    const first = screen.getByRole("button", { name: "Primero" });
    const last = screen.getByRole("button", { name: "Último" });
    expect(document.activeElement).toBe(first);
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("notifica Escape", () => {
    const onEscape = vi.fn();
    render(<FocusTrap onEscape={onEscape}><button type="button">Cerrar</button></FocusTrap>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});