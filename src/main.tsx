import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import { validateDataset } from "@/lib/schemaValidate";
import dataset from "@/data/pc200_payroll_dataset_2026.json";
import schema from "@/data/pc200_payroll_dataset.schema.json";
import "@/index.css";

const rootEl = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootEl);

const result = validateDataset(dataset, schema);

if (!result.valid) {
  root.render(
    <React.StrictMode>
      <div
        style={{
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          maxWidth: "60rem",
          margin: "2rem auto",
        }}
      >
        <h1 style={{ color: "#b91c1c", marginBottom: "1rem" }}>
          Dataset-validatie mislukt
        </h1>
        <p style={{ marginBottom: "1rem" }}>
          De PC 200 Loonmonitor weigert te starten omdat het meegeleverde
          dataset (<code>pc200_payroll_dataset_2026.json</code>) niet voldoet
          aan het schema (<code>pc200_payroll_dataset.schema.json</code>).
        </p>
        <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
          Gevonden fouten ({result.errors.length}):
        </p>
        <ul
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "1rem 1rem 1rem 2rem",
            borderRadius: "0.5rem",
            color: "#7f1d1d",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.875rem",
          }}
        >
          {result.errors.slice(0, 50).map((err, i) => (
            <li key={i}>
              <strong>{err.path || "(root)"}:</strong> {err.message}
            </li>
          ))}
        </ul>
      </div>
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
