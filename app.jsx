import { useState, useEffect, useRef } from "react";

const categories = [
  { id: "wonen", label: "Wonen", icon: "🏠", color: "#e8c547" },
  { id: "voeding", label: "Voeding", icon: "🛒", color: "#e87c47" },
  { id: "transport", label: "Transport", icon: "🚗", color: "#47a8e8" },
  { id: "verzekeringen", label: "Verzekeringen", icon: "🛡️", color: "#9b47e8" },
  { id: "abonnementen", label: "Abonnementen", icon: "📱", color: "#e84747" },
  { id: "vrije_tijd", label: "Vrije tijd", icon: "🎯", color: "#47e8a8" },
  { id: "kleding", label: "Kleding", icon: "👔", color: "#e847b8" },
  { id: "gezondheid", label: "Gezondheid", icon: "💊", color: "#47e8e8" },
  { id: "overig", label: "Overig", icon: "📦", color: "#aaaaaa" },
];

const defaultExpenses = {
  wonen: 950,
  voeding: 400,
  transport: 220,
  verzekeringen: 180,
  abonnementen: 80,
  vrije_tijd: 200,
  kleding: 100,
  gezondheid: 60,
  overig: 150,
};

function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("nl-BE")}
      {suffix}
    </span>
  );
}

function DonutChart({ expenses, total }) {
  const size = 200;
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const slices = categories.map((cat) => {
    const val = expenses[cat.id] || 0;
    const pct = total > 0 ? val / total : 0;
    const dash = pct * circumference;
    const slice = { ...cat, val, pct, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {slices.map((s) => (
        <circle
          key={s.id}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="28"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset}
          style={{ transition: "stroke-dasharray 0.4s ease" }}
        />
      ))}
      <circle cx={cx} cy={cy} r={56} fill="#0f0f0f" />
    </svg>
  );
}

export default function BudgetPlanner() {
  const [income, setIncome] = useState(3200);
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [savingsGoal, setSavingsGoal] = useState(10000);
  const [activeTab, setActiveTab] = useState("budget");
  const [editingId, setEditingId] = useState(null);

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const savings = income - totalExpenses;
  const savingsPct = income > 0 ? (savings / income) * 100 : 0;
  const monthsToGoal = savings > 0 ? Math.ceil(savingsGoal / savings) : null;

  const updateExpense = (id, val) => {
    setExpenses((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const statusColor =
    savings < 0 ? "#e84747" : savings < 200 ? "#e8c547" : "#47e8a8";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#f0f0f0",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0",
      overflowX: "hidden",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e1e1e",
        padding: "28px 32px 24px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", textTransform: "uppercase", marginBottom: 6 }}>
            Persoonlijk Financieel Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 400, letterSpacing: -0.5 }}>
            Budget<span style={{ color: "#e8c547" }}>planner</span>
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Maandelijks saldo</div>
          <div style={{ fontSize: 32, fontWeight: 300, color: statusColor, fontFamily: "monospace", letterSpacing: -1 }}>
            <AnimatedNumber value={savings} prefix={savings >= 0 ? "+€" : "-€"} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e1e1e", background: "#0d0d0d" }}>
        {[
          { id: "budget", label: "Budget" },
          { id: "sparen", label: "Spaardoel" },
          { id: "analyse", label: "Analyse" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              color: activeTab === tab.id ? "#e8c547" : "#555",
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "16px 28px",
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #e8c547" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>

        {/* BUDGET TAB */}
        {activeTab === "budget" && (
          <div>
            {/* Income */}
            <div style={{
              background: "#111",
              border: "1px solid #1e1e1e",
              borderRadius: 4,
              padding: "24px 28px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 8 }}>
                  Maandelijks netto-inkomen
                </div>
                <div style={{ fontSize: 36, fontWeight: 300, fontFamily: "monospace", color: "#fff" }}>
                  €<AnimatedNumber value={income} />
                </div>
              </div>
              <div style={{ flex: 1, maxWidth: 320 }}>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={50}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#e8c547" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginTop: 4 }}>
                  <span>€500</span><span>€10.000</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div style={{ display: "grid", gap: 10 }}>
              {categories.map((cat) => {
                const val = expenses[cat.id] || 0;
                const pct = income > 0 ? (val / income) * 100 : 0;
                const isEditing = editingId === cat.id;

                return (
                  <div
                    key={cat.id}
                    style={{
                      background: "#111",
                      border: `1px solid ${isEditing ? cat.color + "44" : "#1a1a1a"}`,
                      borderRadius: 4,
                      padding: "16px 20px",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      <span style={{ flex: 1, fontSize: 14, color: "#ccc" }}>{cat.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
                          {pct.toFixed(1)}%
                        </span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={val}
                            autoFocus
                            onBlur={() => setEditingId(null)}
                            onChange={(e) => updateExpense(cat.id, Number(e.target.value))}
                            style={{
                              background: "#0a0a0a",
                              border: `1px solid ${cat.color}`,
                              color: "#fff",
                              fontFamily: "monospace",
                              fontSize: 16,
                              padding: "4px 8px",
                              width: 90,
                              borderRadius: 2,
                              textAlign: "right",
                            }}
                          />
                        ) : (
                          <span
                            onClick={() => setEditingId(cat.id)}
                            style={{
                              fontFamily: "monospace",
                              fontSize: 16,
                              color: "#fff",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: 2,
                              border: "1px solid #222",
                              minWidth: 90,
                              textAlign: "right",
                              display: "inline-block",
                            }}
                          >
                            €{val.toLocaleString("nl-BE")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2 }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(pct, 100)}%`,
                        background: cat.color,
                        borderRadius: 2,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div style={{
              marginTop: 24,
              background: "#111",
              border: `1px solid ${statusColor}22`,
              borderRadius: 4,
              padding: "24px 28px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 24,
            }}>
              {[
                { label: "Inkomen", val: income, color: "#47e8a8" },
                { label: "Uitgaven", val: totalExpenses, color: "#e84747" },
                { label: "Over", val: savings, color: statusColor },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", textTransform: "uppercase", marginBottom: 8 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 26, fontFamily: "monospace", color: item.color, fontWeight: 300 }}>
                    €<AnimatedNumber value={item.val} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPAARDOEL TAB */}
        {activeTab === "sparen" && (
          <div>
            <div style={{
              background: "#111",
              border: "1px solid #1e1e1e",
              borderRadius: 4,
              padding: "32px",
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>
                Mijn spaardoel
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: "#555" }}>€</span>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(Math.max(0, Number(e.target.value)))}
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #2a2a2a",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: 32,
                    padding: "8px 16px",
                    borderRadius: 2,
                    width: 220,
                    fontWeight: 300,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#0d0d0d", borderRadius: 4, padding: 20, border: "1px solid #1a1a1a" }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", textTransform: "uppercase", marginBottom: 8 }}>
                    Maandelijks sparen
                  </div>
                  <div style={{ fontSize: 28, fontFamily: "monospace", color: savings > 0 ? "#47e8a8" : "#e84747" }}>
                    €<AnimatedNumber value={Math.max(0, savings)} />
                  </div>
                </div>
                <div style={{ background: "#0d0d0d", borderRadius: 4, padding: 20, border: "1px solid #1a1a1a" }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", textTransform: "uppercase", marginBottom: 8 }}>
                    Tijd tot doel
                  </div>
                  <div style={{ fontSize: 28, fontFamily: "monospace", color: "#e8c547" }}>
                    {monthsToGoal
                      ? monthsToGoal < 12
                        ? `${monthsToGoal} mnd`
                        : `${(monthsToGoal / 12).toFixed(1)} jr`
                      : savings <= 0
                      ? "∞"
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Savings scenarios */}
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>
              Scenario's
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "Bespaar 10% meer op uitgaven", extra: totalExpenses * 0.1 },
                { label: "Bespaar 20% meer op uitgaven", extra: totalExpenses * 0.2 },
                { label: "Extra inkomen van €500", extra: 500 },
              ].map((sc) => {
                const newSavings = savings + sc.extra;
                const months = newSavings > 0 ? Math.ceil(savingsGoal / newSavings) : null;
                return (
                  <div key={sc.label} style={{
                    background: "#111",
                    border: "1px solid #1a1a1a",
                    borderRadius: 4,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{ fontSize: 14, color: "#aaa" }}>{sc.label}</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "monospace", color: "#47e8a8", fontSize: 16 }}>
                        €{Math.round(newSavings).toLocaleString("nl-BE")}/mnd
                      </div>
                      <div style={{ fontSize: 11, color: "#555" }}>
                        {months ? (months < 12 ? `${months} maanden` : `${(months / 12).toFixed(1)} jaar`) : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYSE TAB */}
        {activeTab === "analyse" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              {/* Donut */}
              <div style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: 4,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 20 }}>
                  Verdeling uitgaven
                </div>
                <div style={{ position: "relative" }}>
                  <DonutChart expenses={expenses} total={totalExpenses} />
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>TOTAAL</div>
                    <div style={{ fontFamily: "monospace", fontSize: 16, color: "#fff" }}>
                      €{totalExpenses.toLocaleString("nl-BE")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Health score */}
              <div style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: 4,
                padding: 28,
              }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 20 }}>
                  Financiële gezondheid
                </div>
                {[
                  {
                    label: "Spaarquote",
                    val: savingsPct,
                    good: savingsPct >= 20,
                    ok: savingsPct >= 10,
                    text: savingsPct >= 20 ? "Uitstekend" : savingsPct >= 10 ? "Goed" : "Te laag",
                  },
                  {
                    label: "Woonkost",
                    val: income > 0 ? (expenses.wonen / income) * 100 : 0,
                    good: (expenses.wonen / income) * 100 <= 30,
                    ok: (expenses.wonen / income) * 100 <= 40,
                    text: (expenses.wonen / income) * 100 <= 30 ? "Prima" : (expenses.wonen / income) * 100 <= 40 ? "Aanvaardbaar" : "Te hoog",
                  },
                  {
                    label: "Vaste lasten",
                    val: income > 0 ? ((expenses.wonen + expenses.verzekeringen + expenses.abonnementen) / income) * 100 : 0,
                    good: ((expenses.wonen + expenses.verzekeringen + expenses.abonnementen) / income) * 100 <= 50,
                    ok: ((expenses.wonen + expenses.verzekeringen + expenses.abonnementen) / income) * 100 <= 65,
                    text: ((expenses.wonen + expenses.verzekeringen + expenses.abonnementen) / income) * 100 <= 50 ? "Gezond" : "Let op",
                  },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#aaa" }}>{item.label}</span>
                      <span style={{
                        fontSize: 12,
                        color: item.good ? "#47e8a8" : item.ok ? "#e8c547" : "#e84747",
                        fontFamily: "monospace",
                      }}>
                        {item.val.toFixed(1)}% — {item.text}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2 }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(item.val, 100)}%`,
                        background: item.good ? "#47e8a8" : item.ok ? "#e8c547" : "#e84747",
                        borderRadius: 2,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top categories */}
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>
              Grootste uitgavenposten
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[...categories]
                .sort((a, b) => (expenses[b.id] || 0) - (expenses[a.id] || 0))
                .slice(0, 5)
                .map((cat) => {
                  const val = expenses[cat.id] || 0;
                  const pct = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#111",
                      border: "1px solid #1a1a1a",
                      borderRadius: 4,
                      padding: "12px 16px",
                    }}>
                      <span>{cat.icon}</span>
                      <span style={{ flex: 1, fontSize: 13, color: "#aaa" }}>{cat.label}</span>
                      <div style={{ width: 120, height: 3, background: "#1a1a1a", borderRadius: 2 }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: cat.color,
                          borderRadius: 2,
                          transition: "width 0.4s",
                        }} />
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: 14, color: "#fff", minWidth: 80, textAlign: "right" }}>
                        €{val.toLocaleString("nl-BE")}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555", minWidth: 44, textAlign: "right" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "24px",
        borderTop: "1px solid #151515",
        fontSize: 11,
        color: "#333",
        letterSpacing: 2,
        textTransform: "uppercase",
      }}>
        Budgetplanner Pro · Klik op bedragen om ze te bewerken
      </div>
    </div>
  );
}
