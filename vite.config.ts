import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "https://richclub.efforthye.dev",
          changeOrigin: true,
          secure: false,
        },
        "/naver-news": {
          target: "https://openapi.naver.com",
          changeOrigin: true,
          rewrite: path => path.replace("/naver-news", "/v1/search/news.json"),
          configure: proxy => {
            proxy.on("proxyReq", proxyReq => {
              proxyReq.setHeader("X-Naver-Client-Id", env.VITE_NAVER_CLIENT_ID);
              proxyReq.setHeader(
                "X-Naver-Client-Secret",
                env.VITE_NAVER_CLIENT_SECRET,
              );
            });
          },
        },
      },
    },
    define: {
      global: "window",
    },
  };
});
