import type { ReactNode } from "react";
import { BriefcaseBusiness, CalendarDays, Car, Euro, ReceiptText, UsersRound } from "lucide-react";
import { formatEUR } from "@/lib/money";
import type { Profiel } from "@/lib/profiel";
import { profielPeriodeLabel } from "@/lib/profielLabels";
function geldLabel(profiel: Profiel): string {
    if (profiel.berekeningsRichting === "netto_naar_bruto") {
        return `Doelnetto ${formatEUR(profiel.doelNettoloon)}`;
    }
    return `Bruto ${formatEUR(profiel.brutoloon)}`;
}
function mobiliteitLabel(profiel: Profiel): string {
    const actief = [
        profiel.woonwerkFiets && "fiets",
        profiel.woonwerkPrivewagen && "privéwagen",
        profiel.woonwerkBusTramMetro && "bus/tram/metro",
        profiel.woonwerkTrein && "trein",
        profiel.woonwerkBedrijfswagen && "bedrijfswagen",
    ].filter(Boolean);
    return actief.length > 0 ? actief.join(", ") : "geen mobiliteit";
}
export function ProfielSnapshot({ profiel }: {
    profiel: Profiel;
}) {
    const werknemer = profiel.werknemerNaam || profiel.werknemerReferentie || "Onbenoemde werknemer";
    const werkgever = profiel.werkgeverNaam || profiel.werkgeverOndernemingsnummer || "Geen werkgever ingevuld";
    const gezin = profiel.statuut === "student"
        ? "student"
        : `${profiel.gezinstype.replaceAll("_", " ")} · ${profiel.kinderenTenLaste} kind(eren)`;
    return (<section className="profiel-snapshot" style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
        }}>
      <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 12,
        }}>
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: 3,
        }}>
            Profielsnapshot
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)" }}>
            {werknemer}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{werkgever}</div>
        </div>
      </div>
      <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
        }}>
        <SnapshotItem icon={<CalendarDays size={14}/>} label="Periode" value={profielPeriodeLabel(profiel)}/>
        <SnapshotItem icon={<Euro size={14}/>} label="Loon" value={geldLabel(profiel)}/>
        <SnapshotItem icon={<BriefcaseBusiness size={14}/>} label="Context" value={`${profiel.statuut} · ${Math.round(profiel.tewerkstellingsbreuk * 100)}%`}/>
        <SnapshotItem icon={<UsersRound size={14}/>} label="Fiscaal" value={gezin}/>
        <SnapshotItem icon={<ReceiptText size={14}/>} label="Voordelen" value={profiel.maaltijdchequesActief ? "maaltijdcheques actief" : "geen maaltijdcheques"}/>
        <SnapshotItem icon={<Car size={14}/>} label="Mobiliteit" value={mobiliteitLabel(profiel)}/>
      </div>
    </section>);
}
function SnapshotItem({ icon, label, value, }: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (<div style={{
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-navy-50)",
            padding: "9px 10px",
            minWidth: 0,
        }}>
      <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 800,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            marginBottom: 3,
        }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 650, color: "var(--color-navy-500)" }}>{value}</div>
    </div>);
}
