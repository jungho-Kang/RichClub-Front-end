import axios from "axios";
import { Newspaper } from "lucide-react";
import { useEffect, useState } from "react";

interface NaverNews {
  title: string;
  originallink: string;
  link: string;
  pubDate: string;
}

// HTML 문자열을 텍스트로 디코딩 (태그 + 엔티티 제거)
const stripHtml = (text: string) => {
  return (
    new DOMParser().parseFromString(text, "text/html").body.textContent || ""
  );
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
};

const NewsList = () => {
  const [news, setNews] = useState<NaverNews[]>([]);
  const [loading, setLoading] = useState(true);

  const [query] = useState(() => {
    const queries = ["코스피", "코스닥", "증시", "주식"];
    return queries[Math.floor(Math.random() * queries.length)];
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("/naver-news", {
          params: { query },
          headers: {
            "X-Naver-Client-Id": import.meta.env.VITE_NAVER_CLIENT_ID,
            "X-Naver-Client-Secret": import.meta.env.VITE_NAVER_CLIENT_SECRET,
          },
        });

        setNews(res.data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-[#23242a]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-100">뉴스</h3>
        </div>
      </div>

      {/* content */}
      <div className="p-3">
        {loading ? (
          <div className="p-3 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-zinc-800 animate-pulse"
                style={{ width: `${75 + i * 5}%` }}
              />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-sm text-zinc-500 py-8 text-center">
            표시할 뉴스가 없습니다
          </div>
        ) : (
          <div>
            {/* Fetured 뉴스 */}
            {news[0] && (
              <a
                href={news[0].originallink}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-3 mb-2 rounded-lg border-l-2 border-blue-500 pl-4 bg-linear-to-r from-[#1a1b20] to-transparent hover:pl-5 hover:bg-[#1a1b20] transition-all group"
              >
                <div className="text-sm font-semibold text-zinc-100 leading-snug">
                  {stripHtml(news[0].title)}
                </div>
                <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 mt-1 transition">
                  {formatDate(news[0].pubDate)}
                </div>
              </a>
            )}

            {/* list */}
            <div className="divide-y divide-[#23242a]">
              {news.slice(1, 8).map((n, i) => (
                <a
                  key={i}
                  href={n.originallink}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-2 hover:bg-[#1a1b20] transition group"
                >
                  <div className="text-sm text-zinc-300 group-hover:text-white line-clamp-1">
                    {stripHtml(n.title)}
                  </div>

                  <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 mt-1 transition">
                    {formatDate(n.pubDate)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
