import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function Badge({ children }) {
  return <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 mr-2 mb-1">{children}</span>;
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div className="mb-2">
      <h4 className="text-xs uppercase tracking-wide text-gray-500">{title}</h4>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function List({ items }) {
  if (!items || !items.length) return null;
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((x, i) => <li key={i} className="text-sm leading-snug">{x}</li>)}
    </ul>
  );
}

export default function TechniqueCard({ item }) {
  const [open, setOpen] = useState(false);
  const mitreLink = item.mitre_id ? `https://attack.mitre.org/techniques/${item.mitre_id}/` : null;
  const cveCount = (item.notable_cves || []).reduce((acc, p) => acc + (p.cves?.length || 0), 0);

  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <header className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{item.attack_name || "Unknown Technique"}</h3>
              {item.mitre_id && <Badge>MITRE: {item.mitre_id}</Badge>}
              {cveCount > 0 && <Badge>CVEs: {cveCount}</Badge>}
            </div>
            {item.tactic && <p className="text-xs text-gray-500 mt-1">Tactic: {item.tactic}</p>}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        {item.zos_summary && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.zos_summary}</p>}
      </header>

      {open && (
        <div className="px-4 pb-4">
          {item.services_protocols?.length > 0 && (
            <Section title="Services & Protocols">
              <div className="flex flex-wrap gap-2">
                {item.services_protocols.map((s, i) => (
                  <Badge key={i}>{s}</Badge>
                ))}
              </div>
            </Section>
          )}

          {item.zos_features?.length > 0 && (
            <Section title="z/OS Features">
              <div className="flex flex-wrap gap-2">
                {item.zos_features.map((s, i) => (
                  <Badge key={i}>{s}</Badge>
                ))}
              </div>
            </Section>
          )}

          <Section title="Impact">
            <p className="text-sm leading-snug">{item.impact || "—"}</p>
          </Section>

          <Section title="Example Actions">
            <List items={item.example_actions} />
          </Section>

          <Section title="Detection Signals">
            <List items={item.detection_signals} />
          </Section>

          <Section title="Data Sources">
            <div className="flex flex-wrap gap-2">
              {item.data_sources?.map((d, i) => <Badge key={i}>{d}</Badge>)}
            </div>
          </Section>

          <Section title="Mitigations">
            <List items={item.mitigations} />
          </Section>

          {item.notable_cves?.length > 0 && (
            <Section title="CVEs">
              <ul className="space-y-2">
                {item.notable_cves.map((p, i) => (
                  <li key={i} className="text-sm">
                    <div className="font-medium">{p.product}</div>
                    <div className="text-xs text-gray-500">{(p.cves || []).join(", ")}</div>
                    {p.notes && <div className="text-xs mt-1 text-gray-400">{p.notes}</div>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {mitreLink && (
            <Section title="References">
              <a href={mitreLink} target="_blank" className="text-indigo-600 hover:underline">MITRE ATT&CK page</a>
            </Section>
          )}
        </div>
      )}
    </article>
  );
}
