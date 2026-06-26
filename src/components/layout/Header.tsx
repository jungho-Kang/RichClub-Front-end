import axios from "axios";
import { useEffect, useState } from "react";
import { alertSuccess } from "@/lib/swal";
import { useAuthStore } from "@/stores/useAuthStore";
import { getCookie, removeCookie } from "@/utils/cookie";

import SearchBar from "@/components/ui/SearchBar";
import Subscription from "@/components/subscription/Subscription";

interface User {
  email: string;
  name: string;
}

const PLAN_COLORS: Record<
  string,
  { dot: string; text: string; border: string; bg: string }
> = {
  "basic-plan": {
    dot: "#94a3b8",
    text: "#94a3b8",
    border: "#94a3b8/40",
    bg: "#94a3b8/10",
  },
  "ju-model": {
    dot: "#22c55e",
    text: "#86efac",
    border: "#22c55e/40",
    bg: "#22c55e/10",
  },
  "seo-model": {
    dot: "#7C5CFF",
    text: "#B794F4",
    border: "#7C5CFF/40",
    bg: "#7C5CFF/10",
  },
  "auto-trade": {
    dot: "#f97316",
    text: "#fdba74",
    border: "#f97316/40",
    bg: "#f97316/10",
  },
  telegram: {
    dot: "#06b6d4",
    text: "#67e8f9",
    border: "#06b6d4/40",
    bg: "#06b6d4/10",
  },
};

const PLAN_LABELS: Record<string, string> = {
  "basic-plan": "Demo",
  "ju-model": "Basic",
  "seo-model": "Pro",
  "auto-trade": "Max",
  telegram: "텔레그램",
};

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const { logout } = useAuthStore();

  const accessToken = getCookie("accessToken");

  const fetchSubscription = async () => {
    try {
      const res = await axios.get("/api/v1/subscription");
      console.log(res.data);
      setCurrentPlan(res.data.plan);
    } catch {
      setCurrentPlan(null);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get("/api/v1/auth/me");
      const { email, name } = res.data;
      setUser({ email, name });
    } catch (error) {
      console.log(error);
    }
  };

  const postLogout = async () => {
    try {
      await axios.post("/api/v1/auth/logout");
      await alertSuccess("로그아웃 완료", "정상적으로 로그아웃되었습니다.");
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUserInfo();
      fetchSubscription();
    } else {
      setUser(null);
      setCurrentPlan(null);
    }
  }, [accessToken]);

  const planColor =
    PLAN_COLORS[currentPlan ?? "basic-plan"] ?? PLAN_COLORS["basic-plan"];

  return (
    <>
      <header className="flex items-center justify-between bg-[#141519] border border-[#26272c] rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Rich
              <span className="bg-linear-to-r from-[#7C5CFF] to-[#B794F4] bg-clip-text text-transparent">
                Club
              </span>
            </h2>
            <div className="text-[11px] text-zinc-500 leading-tight">
              AI 매매 시그널
            </div>
          </div>
        </div>

        <SearchBar />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-xs text-zinc-200 font-medium">
                {user?.name}
              </div>
              <div className="text-[10px] text-zinc-500">{user?.email}</div>
            </div>
            <button
              onClick={() => setSubOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer"
              style={{
                borderColor: planColor.dot + "66",
                backgroundColor: planColor.dot + "18",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: planColor.dot }}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: planColor.text }}
              >
                {PLAN_LABELS[currentPlan ?? "basic-plan"] ?? "Demo"}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              removeCookie("accessToken");
              postLogout();
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/15 text-zinc-300 hover:bg-white/5 transition-all cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </header>
      <Subscription
        isOpen={subOpen}
        onClose={() => setSubOpen(false)}
        onSuccess={fetchSubscription}
      />
    </>
  );
};

export default Header;
