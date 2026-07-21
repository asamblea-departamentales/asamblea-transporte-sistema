import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VehicleDropdown } from "./VehicleDropdown";

const options = [
  { id: "one", label: "Vehículo uno" },
  { id: "two", label: "Vehículo dos" },
];

describe("VehicleDropdown", () => {
  it("permite abrir, navegar y seleccionar con teclado", () => {
    const onChange = vi.fn();
    render(<VehicleDropdown value="" onChange={onChange} options={options} placeholder="Seleccione" />);
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("two");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("cierra con Escape", () => {
    render(<VehicleDropdown value="" onChange={vi.fn()} options={options} placeholder="Seleccione" />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});