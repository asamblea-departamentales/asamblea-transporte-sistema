import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Lightbox from "./Lightbox";

const files = [
  { url: "/primera.jpg", name: "Primera", isImage: true },
  { url: "/segunda.jpg", name: "Segunda", isImage: true },
];

describe("Lightbox", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("expone un diálogo accesible y permite navegar con teclado", () => {
    render(<Lightbox files={files} initialIndex={0} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: /Primera/i })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("dialog", { name: /Segunda/i })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("dialog", { name: /Primera/i })).toBeInTheDocument();
  });

  it("cierra con Escape y con clic en el fondo", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { unmount } = render(
      <Lightbox files={files} initialIndex={0} onClose={onClose} />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    vi.advanceTimersByTime(280);
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    onClose.mockClear();
    const second = render(
      <Lightbox files={files} initialIndex={0} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole("dialog", { name: /Primera/i }));
    vi.advanceTimersByTime(280);
    expect(onClose).toHaveBeenCalledTimes(1);
    second.unmount();
  });
});
