// hooks/usePerformance.ts
import { useState, useEffect, useCallback } from "react";
import type {
  UsePerformanceParams,
  UsePerformanceReturn,
  UseSimulationParams,
  UseSimulationReturn,
  PerformanceData,
  SimulationData,
} from "@/types/performance";

const BASE_URL = "/api/v1/market";

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("token") ?? sessionStorage.getItem("token") ?? "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function usePerformance({
  modelId,
  period,
  year,
}: UsePerformanceParams): UsePerformanceReturn {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!modelId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (year != null) {
        params.set("year", String(year));
      } else {
        params.set("period", period ?? "3m");
      }
      const res = await fetch(`${BASE_URL}/performance/${modelId}?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PerformanceData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [modelId, period, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useSimulation({
  modelId,
  principal,
  maxStocks,
  year,
}: UseSimulationParams): UseSimulationReturn {
  const [data, setData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!modelId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        principal: String(principal),
        max_stocks: String(maxStocks),
        ...(year != null ? { year: String(year) } : {}),
      });
      const res = await fetch(`${BASE_URL}/simulation/${modelId}?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SimulationData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [modelId, principal, maxStocks, year]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
