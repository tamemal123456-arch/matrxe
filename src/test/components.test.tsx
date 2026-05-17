import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

describe("Component Rendering", () => {
  it("should render without crashing", () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <div>MATRXe</div>
        </AuthProvider>
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
    expect(container.textContent).toContain("MATRXe");
  });
});
