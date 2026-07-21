import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Outlet } from "react-router-dom";
import App from "./app";

vi.mock("../components/GlobalLoading", () => ({ GlobalLoading: () => <div>loading</div> }));
vi.mock("../layout/AppLayout", () => ({ default: () => <Outlet /> }));
vi.mock("../auth/ProtectedRoute", () => ({ default: () => <Outlet /> }));
vi.mock("../pages/NotificationsPage", () => ({ default: () => <div>notifications page</div> }));

beforeEach(() => {
  window.history.pushState({}, "", "/notificaciones");
});

describe("App routes", () => {
  it("renders the protected notifications route", async () => {
    render(<App />);
    expect(await screen.findByText("notifications page")).toBeInTheDocument();
  });
});