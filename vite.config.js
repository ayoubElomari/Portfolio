import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import mdx from "@mdx-js/rollup";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import remarkDirective from "remark-directive";

import { remarkCustomDirectives } from "./src/lib/remark-custom-directives.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    /* @rendr-web is the one path alias in this repo, on purpose: src/rendr-web/
       is a shared, importable module (not a self-contained project folder), and
       any project that copies in the live-demo kit from
       .project-details/rendr/v2/live-demos/ needs to reach it without computing
       a relative path that depends on how deep the copy lands. See
       src/rendr-web/CLAUDE.md. */
    alias: {
      "@rendr-web": path.resolve(__dirname, "src/rendr-web"),
    },
  },
  plugins: [
    react(),
    svgr(),
    mdx({
      rehypePlugins: [rehypeSlug, rehypeHighlight],
      remarkPlugins: [remarkDirective, remarkCustomDirectives],
    }),
  ],
});
