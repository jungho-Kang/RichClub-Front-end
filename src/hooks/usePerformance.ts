import axios from "axios";
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
      const params: Record<string, string> = {};
      if (year != null) {
        params.year = String(year);
      } else {
        params.period = period ?? "3m";
      }
      const res = await axios.get<PerformanceData>(
        `${BASE_URL}/performance/${modelId}`,
        { params },
      );
      setData(res.data);
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
      const params: Record<string, string> = {
        principal: String(principal),
        max_stocks: String(maxStocks),
        ...(year != null ? { year: String(year) } : {}),
      };
      const res = await axios.get<SimulationData>(
        `${BASE_URL}/simulation/${modelId}`,
        { params },
      );
      console.log(res.data);
      setData(res.data);
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
