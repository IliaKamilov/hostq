import { act, renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import useDebounce from "@/hooks/useDebounce";

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value updates with default delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: "initial" },
      }
    );

    // Initial value
    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated" });
    expect(result.current).toBe("initial"); // Still old value before delay

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // After delay, should update
    expect(result.current).toBe("updated");
  });

  it("should debounce value updates with custom delay", () => {
    const customDelay = 500;
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, customDelay),
      {
        initialProps: { value: "initial" },
      }
    );

    // Update value
    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    // Advance time but not enough
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("updated");
  });

  it("should handle multiple rapid updates", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: "initial" },
      }
    );

    // Multiple rapid updates
    rerender({ value: "update1" });
    rerender({ value: "update2" });
    rerender({ value: "update3" });

    // Should still be initial value
    expect(result.current).toBe("initial");

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Should only have the latest value
    expect(result.current).toBe("update3");
  });

  it("should cleanup timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { unmount } = renderHook(() => useDebounce("test", 300));

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should handle empty string value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: "initial" },
      }
    );

    rerender({ value: "" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("");
  });

  it("should reset timer on value change during delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: "initial" },
      }
    );

    // First update
    rerender({ value: "update1" });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Second update before first completes
    rerender({ value: "update2" });

    // Advance time partially again
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("update2");
  });
});
