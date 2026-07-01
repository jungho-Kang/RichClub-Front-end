import { useEffect } from "react";
import Header from "@/components/layout/Header";
import SimulationSection from "@/components/performance/SimulationSection";
import { useStockStore } from "@/stores/useStockStore";
import type { ModelId } from "@/types/performance";
import { useSearchParams } from "react-router-dom";

const SimulationPage = () => {
  const { models, fetchModels } = useStockStore();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const modelId = (searchParams.get("modelId") ?? "ju-model-v2") as ModelId;
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : null;

  const handleModelChange = (id: ModelId) => {
    const next = new URLSearchParams(searchParams);
    next.set("modelId", id);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans">
      <div className="p-4 pb-0">
        <Header />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xl font-bold text-white">AI 투자 시뮬레이션</h2>
          <div className="flex gap-2">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => handleModelChange(m.id)}
                className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                  modelId === m.id
                    ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <SimulationSection modelId={modelId} year={year} />
      </div>
    </div>
  );
};

export default SimulationPage;
