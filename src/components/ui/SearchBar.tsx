import axios from "axios";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { SelectedStockItem } from "@/types/stock";
import { useStockStore } from "@/stores/useStockStore";

const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  // 항목이 선택된 후에도 열리는 버그 수정 State
  const [isSelecting, setIsSelecting] = useState(false);
  const [list, setList] = useState<SelectedStockItem[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { setSelectedStock } = useStockStore();

  // debounce 검색
  useEffect(() => {
    if (isSelecting) return;

    if (!keyword.trim()) {
      setList([]);
      return;
    }

    const timer = setTimeout(() => {
      getSearchStocks(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const getSearchStocks = async (q: string) => {
    try {
      const res = await axios.get("/api/v1/stock/search", {
        params: { q },
      });
      console.log(res.data);

      setList(res.data);
      setOpen(true);
    } catch (e) {
      console.log(e);
    }
  };

  // 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative max-w-150 w-full">
      {/* input */}
      <div className="flex items-center gap-2 bg-[#1a1c22] border border-[#2a2d35] rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-zinc-400" />

        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onFocus={() => list.length > 0 && setOpen(true)}
          placeholder="종목 검색"
          className="bg-transparent outline-none text-sm text-white w-full placeholder:text-zinc-500"
        />

        {keyword && (
          <button
            onClick={() => {
              setKeyword("");
              setList([]);
              setOpen(false);
            }}
            className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/10 active:scale-90 transition-all"
          >
            <X className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* dropdown */}
      {open && list.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1c22] border border-[#2a2d35] rounded-xl overflow-hidden shadow-lg z-50 max-h-56 overflow-y-auto">
          {list.map(item => (
            <div
              key={item.stock_code}
              onClick={() => {
                setIsSelecting(true);
                setSelectedStock(item);
                setKeyword(item.stock_name);
                setOpen(false);

                setTimeout(() => {
                  setIsSelecting(false);
                }, 0);
              }}
              className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex flex-col"
            >
              <span className="text-sm font-medium text-white leading-tight">
                {item.stock_name}
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5">
                {item.stock_code}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
