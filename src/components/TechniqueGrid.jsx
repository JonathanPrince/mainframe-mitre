import React from "react";
import TechniqueCard from "./TechniqueCard.jsx";

export default function TechniqueGrid({ groups }) {
  if (!groups.length) {
    return <p className="text-gray-500">No techniques match your filters.</p>;
  }
  return (
    <div className="space-y-8">
      {groups.map(([tactic, items]) => (
        <section key={tactic}>
          <h2 className="text-lg font-semibold mb-3">{tactic} <span className="text-sm text-gray-500">({items.length})</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((t) => (
              <TechniqueCard key={(t.attack_name||'') + (t.mitre_id||'')} item={t} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
