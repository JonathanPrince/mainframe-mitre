import React, { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Search } from "lucide-react";
import TechniqueGrid from "./components/TechniqueGrid.jsx";

const DATA_URL = "/data/zos-mitre-data.json";

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return { theme, setTheme };
}

export default function App() {
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState({ mappings: [], metadata: {} });
  const [query, setQuery] = useState("");
  const [tacticFilter, setTacticFilter] = useState("All");

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch((e) => console.error("Failed to load data:", e));
  }, []);

  const tactics = useMemo(() => {
    const ts = new Set(data.mappings.map((m) => m.tactic || "Unknown"));
    return ["All", ...Array.from(ts).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.mappings.filter((m) => {
      if (tacticFilter !== "All" && (m.tactic || "Unknown") !== tacticFilter) return false;
      if (!q) return true;
      const fields = [
        m.attack_name,
        m.mitre_id,
        m.tactic,
        ...(m.services_protocols || []),
        ...(m.zos_features || []),
        ...(m.detection_signals || []),
        ...(m.mitigations || []),
      ];
      const cves = (m.notable_cves || []).flatMap((p) => [p.product, ...(p.cves || [])]);
      fields.push(...cves);
      return fields.filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, query, tacticFilter]);

  const groupedByTactic = useMemo(() => {
    const map = new Map();
    filtered.forEach((m) => {
      const t = m.tactic || "Unknown";
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(m);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">z/OS MITRE ATT&CK Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="pl-8 pr-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 sm:w-80"
                placeholder="Search techniques, CVEs, z/OS features..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="px-2 py-2 rounded-md bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={tacticFilter}
              onChange={(e) => setTacticFilter(e.target.value)}
            >
              {tactics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <TechniqueGrid groups={groupedByTactic} />
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
        {data.metadata?.technique_count ? (
          <p>
            Loaded {data.metadata.technique_count} techniques. Last updated:{" "}
            {data.metadata.enriched?.timestamp || data.metadata.generated_on || "n/a"}
          </p>
        ) : (
          <p>Loaded {filtered.length} techniques.</p>
        )}
      </footer>
    </div>
  );
}
