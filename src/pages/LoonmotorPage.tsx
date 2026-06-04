import { useEffect, useMemo, useState } from "react";
import { Building2, Database, ExternalLink, FileLock2, Loader2, Plus, Save, Search, UserPlus, Users } from "lucide-react";
import { Banner } from "@/components/Banner";
import { FormField, inputClass, selectClass } from "@/components/Field";
import { fetchKboHtml, isAppHtml, isValidKboNumber, normalizeKboNumber, parseKboPage } from "@/lib/kbo";
import {
  createLeegBedrijf,
  createMedewerkerVoorBedrijf,
  maskInsz,
  readLoonmotorDossiers,
  writeLoonmotorDossiers,
  type LoonmotorBedrijf,
  type LoonmotorDossier,
  type LoonmotorMedewerker,
} from "@/lib/loonmotor";
import { bouwLoonficheVoorProfiel } from "@/lib/loonfiche";
import { formatEUR } from "@/lib/money";
import { DEFAULTS, normaliseerProfiel, type Profiel } from "@/lib/profiel";
import { useSharedProfiel } from "@/lib/useSharedProfiel";

interface LoonmotorPageProps {
  initialDossiers?: LoonmotorDossier[];
}

type Status = { kind: "success" | "error" | "info"; tekst: string } | null;

export function LoonmotorPage({ initialDossiers }: LoonmotorPageProps) {
  const [dossiers, setDossiers] = useState<LoonmotorDossier[]>(() => initialDossiers ?? readLoonmotorDossiers());
  const [selectedId, setSelectedId] = useState(() => dossiers[0]?.bedrijf.id ?? "");
  const [kboInput, setKboInput] = useState("");
  const [kboLoading, setKboLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [toonMedewerkerForm, setToonMedewerkerForm] = useState(false);
  const [, setSharedProfiel] = useSharedProfiel();

  useEffect(() => {
    if (initialDossiers) return;
    writeLoonmotorDossiers(undefined, dossiers);
  }, [dossiers, initialDossiers]);

  useEffect(() => {
    if (!selectedId && dossiers[0]) setSelectedId(dossiers[0].bedrijf.id);
  }, [dossiers, selectedId]);

  const selected = dossiers.find((dossier) => dossier.bedrijf.id === selectedId) ?? dossiers[0] ?? null;

  async function maakBedrijfViaKbo() {
    const formatted = normalizeKboNumber(kboInput);
    if (!/^\d{4}\.\d{3}\.\d{3}$/.test(formatted)) {
      setStatus({ kind: "error", tekst: "Gebruik formaat XXXX.XXX.XXX." });
      return;
    }
    if (!isValidKboNumber(formatted)) {
      setStatus({ kind: "error", tekst: "Ongeldig ondernemingsnummer." });
      return;
    }

    setKboLoading(true);
    setStatus({ kind: "info", tekst: "KBO-gegevens worden opgehaald." });
    try {
      const result = await fetchKboHtml(formatted.replace(/\D/g, ""));
      const parsed = parseKboPage(result.html);
      if (parsed.name || parsed.form || parsed.address.street) {
        const bedrijf = {
          ...createLeegBedrijf(),
          ondernemingsnummer: formatted,
          naam: parsed.name,
          rechtsvorm: parsed.form,
          boekjaareinde: parsed.yearEnd,
          adres: {
            straat: parsed.address.street,
            huisnummer: parsed.address.houseNr,
            postcode: parsed.address.zip,
            gemeente: parsed.address.city,
          },
          bron: "kbo" as const,
          bijgewerktOp: new Date().toISOString(),
        };
        voegDossierToe(bedrijf);
        setStatus({ kind: "success", tekst: `Gegevens opgehaald${parsed.name ? `: ${parsed.name}` : ""}.` });
        setKboInput(formatted);
        return;
      }
      if (!result.ok) {
        setStatus({ kind: "error", tekst: `KBO gaf geen bruikbare gegevens terug (status ${result.status}).` });
      } else if (isAppHtml(result.html)) {
        setStatus({ kind: "error", tekst: "KBO-proxy niet actief in deze omgeving." });
      } else {
        setStatus({ kind: "error", tekst: `Geen KBO-gegevens gevonden voor ${formatted}.` });
      }
    } catch (error) {
      setStatus({ kind: "error", tekst: `KBO-lookup niet beschikbaar: ${error instanceof Error ? error.message : "onbekende fout"}.` });
    } finally {
      setKboLoading(false);
    }
  }

  function voegHandmatigBedrijfToe() {
    const bedrijf = createLeegBedrijf();
    voegDossierToe(bedrijf);
    setStatus({ kind: "success", tekst: "Handmatig bedrijfsconcept aangemaakt." });
  }

  function voegDossierToe(bedrijf: LoonmotorBedrijf) {
    setDossiers((prev) => {
      const next = [{ bedrijf, medewerkers: [] }, ...prev];
      setSelectedId(bedrijf.id);
      return next;
    });
  }

  function updateSelectedBedrijf(update: Partial<LoonmotorBedrijf>) {
    if (!selected) return;
    setDossiers((prev) =>
      prev.map((dossier) =>
        dossier.bedrijf.id === selected.bedrijf.id
          ? { ...dossier, bedrijf: { ...dossier.bedrijf, ...update, bijgewerktOp: new Date().toISOString() } }
          : dossier,
      ),
    );
  }

  function updateSelectedDefaults(update: Partial<LoonmotorBedrijf["defaults"]>) {
    if (!selected) return;
    updateSelectedBedrijf({ defaults: { ...selected.bedrijf.defaults, ...update } });
  }

  function voegMedewerkerToe(medewerker: LoonmotorMedewerker) {
    setDossiers((prev) =>
      prev.map((dossier) =>
        dossier.bedrijf.id === medewerker.bedrijfId
          ? { ...dossier, medewerkers: [...dossier.medewerkers, medewerker] }
          : dossier,
      ),
    );
    setToonMedewerkerForm(false);
    setStatus({ kind: "success", tekst: "Medewerker toegevoegd aan lokaal conceptdossier." });
  }

  function openInCalculator(medewerker: LoonmotorMedewerker) {
    setSharedProfiel(normaliseerProfiel(medewerker.profiel));
    if (typeof window !== "undefined") window.location.hash = "#/";
  }

  function conceptBewaren() {
    writeLoonmotorDossiers(undefined, dossiers);
    setStatus({ kind: "success", tekst: "Concept lokaal bewaard in deze browser." });
  }

  return (
    <div className="loonmotor-layout" style={{ width: "100%", maxWidth: 1340, margin: "0 auto", padding: "1.5rem 1rem", minWidth: 0, boxSizing: "border-box", overflowX: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={iconTileStyle("var(--color-primary-soft)", "var(--color-primary)")}>
            <Building2 size={20} />
          </span>
          <div style={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word" }}>
            <h1 style={titleStyle}>Loonmotor</h1>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", overflowWrap: "anywhere", wordBreak: "break-word" }}>
              Bedrijven, medewerkers en lokale conceptdossiers voor PC 200.
            </div>
          </div>
        </div>
        <div className="loonmotor-empty-actions" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, width: "100%" }}>
          <button type="button" onClick={conceptBewaren} style={buttonStyle("secondary")}>
            <Save size={14} />
            Concept bewaren
          </button>
          <button type="button" disabled style={buttonStyle("disabled")} title="Beschikbaar na backendkoppeling">
            <FileLock2 size={14} />
            Backend opslaan
          </button>
        </div>
      </div>

      <Banner kind="info" title="Lokale concepten">
        Deze loonmotor bewaart v1-dossiers alleen lokaal in deze browser. Er is nog geen backend-synchronisatie of officiele payrollfinalisatie.
      </Banner>

      {status && (
        <div style={{ marginTop: 12 }}>
          <Banner kind={status.kind === "success" ? "success" : status.kind === "error" ? "error" : "info"}>{status.tekst}</Banner>
        </div>
      )}

      {dossiers.length === 0 ? (
        <LegeStaat
          kboInput={kboInput}
          setKboInput={setKboInput}
          kboLoading={kboLoading}
          onLookup={() => void maakBedrijfViaKbo()}
          onManual={voegHandmatigBedrijfToe}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]" style={{ gap: 16, marginTop: 18 }}>
          <BedrijvenLijst dossiers={dossiers} selectedId={selected?.bedrijf.id ?? ""} onSelect={setSelectedId} />
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <BedrijfHeader bedrijf={selected.bedrijf} medewerkerAantal={selected.medewerkers.length} />
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]" style={{ gap: 16 }}>
                <BedrijfForm bedrijf={selected.bedrijf} onUpdate={updateSelectedBedrijf} onDefaultsUpdate={updateSelectedDefaults} />
                <ActiePaneel bedrijf={selected.bedrijf} medewerkers={selected.medewerkers} onAddEmployee={() => setToonMedewerkerForm(true)} />
              </div>
              <MedewerkersTabel medewerkers={selected.medewerkers} onOpenInCalculator={openInCalculator} onAddEmployee={() => setToonMedewerkerForm(true)} />
            </div>
          )}
        </div>
      )}

      {toonMedewerkerForm && selected && (
        <MedewerkerModal bedrijf={selected.bedrijf} onClose={() => setToonMedewerkerForm(false)} onSave={voegMedewerkerToe} />
      )}
    </div>
  );
}

function LegeStaat({ kboInput, setKboInput, kboLoading, onLookup, onManual }: {
  kboInput: string;
  setKboInput: (value: string) => void;
  kboLoading: boolean;
  onLookup: () => void;
  onManual: () => void;
}) {
  return (
    <section style={{ ...panelStyle, marginTop: 18, padding: 24 }}>
      <div className="kbo-lookup-card">
        <div className="kbo-field-label">Ondernemingsnummer</div>
        <div className="kbo-lookup-row">
          <input
            className={inputClass}
            value={kboInput}
            onChange={(event) => setKboInput(event.target.value)}
            onBlur={(event) => {
              const normalized = normalizeKboNumber(event.target.value);
              if (normalized) setKboInput(normalized);
            }}
            placeholder="XXXX.XXX.XXX"
            style={{ minHeight: 44, fontSize: 16 }}
          />
          <button type="button" onClick={onLookup} disabled={kboLoading} style={buttonStyle("primary")}>
            {kboLoading ? <Loader2 size={15} /> : <Search size={15} />}
            Ophalen uit KBO
          </button>
        </div>
        <div className="kbo-helper-text">Vul bijvoorbeeld 0452.085.227 in. Jaakie vult publieke KBO-gegevens aan waar beschikbaar.</div>
        <div className="kbo-secondary-actions">
          <span>Geen ondernemingsnummer bij de hand?</span>
          <button type="button" onClick={onManual} style={buttonStyle("secondary")}>
            <Plus size={15} />
            Handmatig bedrijf aanmaken
          </button>
        </div>
      </div>
    </section>
  );
}

function BedrijvenLijst({ dossiers, selectedId, onSelect }: {
  dossiers: LoonmotorDossier[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside style={{ ...panelStyle, padding: 12, alignSelf: "start" }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", margin: "4px 6px 10px" }}>
        Bedrijven
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {dossiers.map((dossier) => {
          const active = dossier.bedrijf.id === selectedId;
          return (
            <button key={dossier.bedrijf.id} type="button" onClick={() => onSelect(dossier.bedrijf.id)} style={{
              textAlign: "left",
              border: active ? "1px solid var(--color-primary-border)" : "1px solid transparent",
              background: active ? "var(--color-primary-soft)" : "transparent",
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              cursor: "pointer",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{dossier.bedrijf.naam || "Naamloze onderneming"}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {dossier.bedrijf.ondernemingsnummer || "Geen ondernemingsnummer"} · {dossier.medewerkers.length} medewerker{dossier.medewerkers.length === 1 ? "" : "s"}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function BedrijfHeader({ bedrijf, medewerkerAantal }: { bedrijf: LoonmotorBedrijf; medewerkerAantal: number }) {
  const adres = [bedrijf.adres.straat && `${bedrijf.adres.straat} ${bedrijf.adres.huisnummer}`.trim(), bedrijf.adres.postcode && `${bedrijf.adres.postcode} ${bedrijf.adres.gemeente}`.trim()].filter(Boolean).join(", ");
  return (
    <section style={{ ...panelStyle, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <StatusChip label="PC 200" />
            <StatusChip label={bedrijf.bron === "kbo" ? "KBO-bron" : "Handmatig"} />
            <StatusChip label="Lokaal concept" />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 850, color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
            {bedrijf.naam || "Naamloze onderneming"}
          </h2>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--color-text-muted)" }}>
            {[bedrijf.ondernemingsnummer, bedrijf.rechtsvorm, adres].filter(Boolean).join(" · ") || "Vul de bedrijfsgegevens aan om dit dossier bruikbaar te maken."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={metricStyle}>
            <strong>{medewerkerAantal}</strong>
            <span>Medewerkers</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function BedrijfForm({ bedrijf, onUpdate, onDefaultsUpdate }: {
  bedrijf: LoonmotorBedrijf;
  onUpdate: (update: Partial<LoonmotorBedrijf>) => void;
  onDefaultsUpdate: (update: Partial<LoonmotorBedrijf["defaults"]>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section style={{ ...panelStyle, padding: 18 }}>
        <SectionTitle icon={<Database size={16} />} title="KBO-gegevens" />
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <FormField label={<LabelWithBadge label="Ondernemingsnummer" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.ondernemingsnummer} onChange={(event) => onUpdate({ ondernemingsnummer: event.target.value })} placeholder="0452.085.227" />
          </FormField>
          <FormField label={<LabelWithBadge label="Naam" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.naam} onChange={(event) => onUpdate({ naam: event.target.value })} placeholder="Bedrijfsnaam" />
          </FormField>
          <FormField label={<LabelWithBadge label="Rechtsvorm" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.rechtsvorm} onChange={(event) => onUpdate({ rechtsvorm: event.target.value })} placeholder="BV, NV, VZW..." />
          </FormField>
          <FormField label={<LabelWithBadge label="Boekjaareinde" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.boekjaareinde} onChange={(event) => onUpdate({ boekjaareinde: event.target.value })} placeholder="31 december" />
          </FormField>
          <FormField label={<LabelWithBadge label="Straat" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.adres.straat} onChange={(event) => onUpdate({ adres: { ...bedrijf.adres, straat: event.target.value } })} />
          </FormField>
          <FormField label={<LabelWithBadge label="Huisnummer" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.adres.huisnummer} onChange={(event) => onUpdate({ adres: { ...bedrijf.adres, huisnummer: event.target.value } })} />
          </FormField>
          <FormField label={<LabelWithBadge label="Postcode" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.adres.postcode} onChange={(event) => onUpdate({ adres: { ...bedrijf.adres, postcode: event.target.value } })} />
          </FormField>
          <FormField label={<LabelWithBadge label="Gemeente" badge={bedrijf.bron === "kbo" ? "KBO" : undefined} />}>
            <input className={inputClass} value={bedrijf.adres.gemeente} onChange={(event) => onUpdate({ adres: { ...bedrijf.adres, gemeente: event.target.value } })} />
          </FormField>
        </div>
      </section>

      <section style={{ ...panelStyle, padding: 18 }}>
        <SectionTitle icon={<Building2 size={16} />} title="Payrollinstellingen" />
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <FormField label="Arbeidsongevallenpercentage">
            <input className={inputClass} type="number" step="0.001" value={bedrijf.defaults.arbeidsongevallenPct} onChange={(event) => onDefaultsUpdate({ arbeidsongevallenPct: Number(event.target.value) })} />
          </FormField>
          <FormField label="Eerste aanwerving">
            <select className={selectClass} value={bedrijf.defaults.eersteAanwerving ? "ja" : "nee"} onChange={(event) => onDefaultsUpdate({ eersteAanwerving: event.target.value === "ja" })}>
              <option value="nee">Nee</option>
              <option value="ja">Ja</option>
            </select>
          </FormField>
          <FormField label="Maaltijdcheques">
            <select className={selectClass} value={bedrijf.defaults.maaltijdchequesActief ? "actief" : "niet_actief"} onChange={(event) => onDefaultsUpdate({ maaltijdchequesActief: event.target.value === "actief" })}>
              <option value="niet_actief">Niet actief</option>
              <option value="actief">Actief</option>
            </select>
          </FormField>
          <FormField label="Werkgeversaandeel maaltijdcheque">
            <input className={inputClass} type="number" step="0.01" value={bedrijf.defaults.maaltijdchequeWerkgeversaandeelPerDag} onChange={(event) => onDefaultsUpdate({ maaltijdchequeWerkgeversaandeelPerDag: Number(event.target.value) })} />
          </FormField>
          <FormField label="Groepsverzekering werkgever/maand">
            <input className={inputClass} type="number" step="0.01" value={bedrijf.defaults.groepsverzekeringWerkgeverPerMaand} onChange={(event) => onDefaultsUpdate({ groepsverzekeringWerkgeverPerMaand: Number(event.target.value) })} />
          </FormField>
          <FormField label="Hospitalisatie werkgever/maand">
            <input className={inputClass} type="number" step="0.01" value={bedrijf.defaults.hospitalisatieWerkgeverPerMaand} onChange={(event) => onDefaultsUpdate({ hospitalisatieWerkgeverPerMaand: Number(event.target.value) })} />
          </FormField>
        </div>
      </section>

      <section style={{ ...panelStyle, padding: 18 }}>
        <SectionTitle icon={<Users size={16} />} title="Contact & notities" />
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <FormField label="Contactpersoon">
            <input className={inputClass} value={bedrijf.contactpersoon} onChange={(event) => onUpdate({ contactpersoon: event.target.value })} />
          </FormField>
          <FormField label="E-mail">
            <input className={inputClass} type="email" value={bedrijf.email} onChange={(event) => onUpdate({ email: event.target.value })} />
          </FormField>
          <FormField label="Telefoon">
            <input className={inputClass} value={bedrijf.telefoon} onChange={(event) => onUpdate({ telefoon: event.target.value })} />
          </FormField>
        </div>
        <div style={{ marginTop: 12 }}>
          <FormField label="Notities">
            <textarea className={inputClass} value={bedrijf.notities} onChange={(event) => onUpdate({ notities: event.target.value })} rows={3} />
          </FormField>
        </div>
      </section>
    </div>
  );
}

function ActiePaneel({ bedrijf, medewerkers, onAddEmployee }: {
  bedrijf: LoonmotorBedrijf;
  medewerkers: LoonmotorMedewerker[];
  onAddEmployee: () => void;
}) {
  return (
    <aside style={{ ...panelStyle, padding: 18, alignSelf: "start" }}>
      <SectionTitle icon={<UserPlus size={16} />} title="Dossieracties" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={onAddEmployee} style={buttonStyle("primary")}>
          <UserPlus size={15} />
          Medewerker toevoegen
        </button>
        <button type="button" disabled style={buttonStyle("disabled")}>
          <ExternalLink size={15} />
          Toevoegen aan loonrun
        </button>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
        <MiniStat label="Onderneming" value={bedrijf.naam || "Nog aan te vullen"} />
        <MiniStat label="Medewerkers" value={String(medewerkers.length)} />
        <MiniStat label="Opslag" value="Lokaal concept" />
      </div>
    </aside>
  );
}

function MedewerkersTabel({ medewerkers, onOpenInCalculator, onAddEmployee }: {
  medewerkers: LoonmotorMedewerker[];
  onOpenInCalculator: (medewerker: LoonmotorMedewerker) => void;
  onAddEmployee: () => void;
}) {
  return (
    <section style={{ ...panelStyle, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <SectionTitle icon={<Users size={16} />} title="Medewerkers" />
        <button type="button" onClick={onAddEmployee} style={buttonStyle("secondary")}>
          <Plus size={14} />
          Medewerker
        </button>
      </div>
      {medewerkers.length === 0 ? (
        <div style={{ border: "1px dashed var(--color-border)", borderRadius: "var(--radius-md)", padding: 18, color: "var(--color-text-muted)", fontSize: 13 }}>
          Nog geen medewerkers. Voeg een eerste werknemer toe om indicatieve netto- en werkgeverskostcijfers te zien.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-navy-50)" }}>
                {["Naam", "Statuut", "Functie", "Bruto", "Tewerkstelling", "Startdatum", "Indicatief netto", "Werkgeverskost", "INSZ", "Actie"].map((header) => (
                  <th key={header} style={thStyle}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medewerkers.map((medewerker) => {
                const indicatie = berekenIndicatie(medewerker);
                return (
                  <tr key={medewerker.id} style={{ borderBottom: "1px solid var(--color-navy-50)" }}>
                    <td style={tdStyle}><strong>{medewerker.naam || "Naam ontbreekt"}</strong><br /><span style={mutedStyle}>{medewerker.referentie || "Geen referentie"}</span></td>
                    <td style={tdStyle}>{medewerker.statuut}</td>
                    <td style={tdStyle}>{medewerker.functie || "-"}</td>
                    <td style={tdRightStyle}>{formatEUR(medewerker.profiel.brutoloon)}</td>
                    <td style={tdRightStyle}>{Math.round(medewerker.profiel.tewerkstellingsbreuk * 100)}%</td>
                    <td style={tdStyle}>{medewerker.startdatum || "-"}</td>
                    <td style={tdRightStyle}>{indicatie.netto}</td>
                    <td style={tdRightStyle}>{indicatie.werkgeverskost}</td>
                    <td style={tdStyle}>{maskInsz(medewerker.insz) || "-"}</td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => onOpenInCalculator(medewerker)} style={smallButtonStyle}>
                        Open in calculator
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MedewerkerModal({ bedrijf, onClose, onSave }: {
  bedrijf: LoonmotorBedrijf;
  onClose: () => void;
  onSave: (medewerker: LoonmotorMedewerker) => void;
}) {
  const [naam, setNaam] = useState("");
  const [referentie, setReferentie] = useState("");
  const [insz, setInsz] = useState("");
  const [geboortedatum, setGeboortedatum] = useState("");
  const [startdatum, setStartdatum] = useState("2026-01-01");
  const [functie, setFunctie] = useState("");
  const [profiel, setProfiel] = useState<Profiel>(() =>
    normaliseerProfiel({
      ...DEFAULTS,
      werkgeverNaam: bedrijf.naam,
      werkgeverOndernemingsnummer: bedrijf.ondernemingsnummer,
      arbeidsongevallenPct: bedrijf.defaults.arbeidsongevallenPct,
      maaltijdchequesActief: bedrijf.defaults.maaltijdchequesActief,
      maaltijdchequeWerkgeversaandeelPerDag: bedrijf.defaults.maaltijdchequeWerkgeversaandeelPerDag,
      maaltijdchequeWerknemersbijdragePerDag: bedrijf.defaults.maaltijdchequeWerknemersbijdragePerDag,
    }),
  );

  const medewerker = useMemo(() => {
    const basis = createMedewerkerVoorBedrijf(bedrijf, undefined, {
      ...profiel,
      werknemerNaam: naam,
      werknemerReferentie: referentie,
    });
    return {
      ...basis,
      naam,
      referentie,
      insz,
      geboortedatum,
      startdatum,
      functie,
      status: "te_controleren" as const,
    };
  }, [bedrijf, geboortedatum, functie, insz, naam, profiel, referentie, startdatum]);

  return (
    <div style={modalOverlayStyle} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ ...titleStyle, fontSize: 18 }}>Medewerker toevoegen</h2>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{bedrijf.naam || "Nieuw bedrijf"} · lokaal concept</div>
          </div>
          <button type="button" onClick={onClose} style={smallButtonStyle}>Sluiten</button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <section>
            <SectionTitle icon={<Users size={16} />} title="Identiteit" />
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
              <FormField label="Naam">
                <input className={inputClass} value={naam} onChange={(event) => setNaam(event.target.value)} placeholder="Jan Peeters" />
              </FormField>
              <FormField label="Referentie">
                <input className={inputClass} value={referentie} onChange={(event) => setReferentie(event.target.value)} placeholder="W12345" />
              </FormField>
              <FormField label="INSZ (optioneel)" helper="Wordt gemaskeerd in de lijstweergave. Niet nodig voor simulatie.">
                <input className={inputClass} value={insz} onChange={(event) => setInsz(event.target.value)} placeholder="85.07.30-123.45" />
              </FormField>
              <FormField label="Geboortedatum (optioneel)">
                <input className={inputClass} type="date" value={geboortedatum} onChange={(event) => setGeboortedatum(event.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <SectionTitle icon={<Building2 size={16} />} title="Contract & loon" />
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
              <FormField label="Startdatum">
                <input className={inputClass} type="date" value={startdatum} onChange={(event) => setStartdatum(event.target.value)} />
              </FormField>
              <FormField label="Functie">
                <input className={inputClass} value={functie} onChange={(event) => setFunctie(event.target.value)} placeholder="Payroll officer" />
              </FormField>
              <FormField label="Statuut">
                <select className={selectClass} value={profiel.statuut} onChange={(event) => setProfiel((prev) => ({ ...prev, statuut: event.target.value as Profiel["statuut"] }))}>
                  <option value="bediende">Bediende</option>
                  <option value="student">Student</option>
                </select>
              </FormField>
              <FormField label="Brutoloon">
                <input className={inputClass} type="number" value={profiel.brutoloon} onChange={(event) => setProfiel((prev) => ({ ...prev, brutoloon: Number(event.target.value) }))} />
              </FormField>
              <FormField label="Tewerkstelling (%)">
                <input className={inputClass} type="number" value={Math.round(profiel.tewerkstellingsbreuk * 100)} onChange={(event) => setProfiel((prev) => ({ ...prev, tewerkstellingsbreuk: Number(event.target.value) / 100 }))} />
              </FormField>
              <FormField label="Ervaring jaren">
                <input className={inputClass} type="number" value={profiel.ervaringJaren} onChange={(event) => setProfiel((prev) => ({ ...prev, ervaringJaren: Number(event.target.value) }))} />
              </FormField>
            </div>
          </section>

          <section>
            <SectionTitle icon={<Database size={16} />} title="Fiscale context" />
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
              <FormField label="Gezinstype">
                <select className={selectClass} value={profiel.gezinstype} onChange={(event) => setProfiel((prev) => ({ ...prev, gezinstype: event.target.value as Profiel["gezinstype"] }))}>
                  <option value="alleenstaand">Alleenstaand</option>
                  <option value="gehuwd_partner_inkomen">Gehuwd/partner met inkomen</option>
                  <option value="gehuwd_partner_geen_inkomen">Partner zonder of beperkt inkomen</option>
                </select>
              </FormField>
              <FormField label="Kinderen ten laste">
                <input className={inputClass} type="number" value={profiel.kinderenTenLaste} onChange={(event) => setProfiel((prev) => ({ ...prev, kinderenTenLaste: Number(event.target.value) }))} />
              </FormField>
              <FormField label="Berekeningsmaand">
                <input className={inputClass} type="month" value={`${profiel.berekeningsJaar}-${profiel.berekeningsMaand}`} onChange={(event) => {
                  const [jaar, maand] = event.target.value.split("-");
                  setProfiel((prev) => ({ ...prev, berekeningsJaar: jaar, berekeningsMaand: maand }));
                }} />
              </FormField>
            </div>
          </section>

          <section>
            <SectionTitle icon={<Database size={16} />} title="Voordelen & mobiliteit" />
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
              <FormField label="Maaltijdcheques">
                <select className={selectClass} value={profiel.maaltijdchequesActief ? "ja" : "nee"} onChange={(event) => setProfiel((prev) => ({ ...prev, maaltijdchequesActief: event.target.value === "ja" }))}>
                  <option value="nee">Nee</option>
                  <option value="ja">Ja</option>
                </select>
              </FormField>
              <FormField label="Groepsverzekering eigen bijdrage">
                <input className={inputClass} type="number" value={profiel.groepsverzekeringEigenBijdrage} onChange={(event) => setProfiel((prev) => ({ ...prev, groepsverzekeringEigenBijdrage: Number(event.target.value) }))} />
              </FormField>
              <FormField label="Onkostenvergoeding/maand">
                <input className={inputClass} type="number" value={profiel.onkostenvergoedingPerMaand} onChange={(event) => setProfiel((prev) => ({ ...prev, onkostenvergoedingPerMaand: Number(event.target.value) }))} />
              </FormField>
            </div>
          </section>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={buttonStyle("secondary")}>Annuleren</button>
          <button type="button" onClick={() => onSave(medewerker)} style={buttonStyle("primary")}>Medewerker bewaren</button>
        </div>
      </div>
    </div>
  );
}

function berekenIndicatie(medewerker: LoonmotorMedewerker): { netto: string; werkgeverskost: string } {
  try {
    const loonfiche = bouwLoonficheVoorProfiel(medewerker.profiel);
    return {
      netto: formatEUR(loonfiche.totalen.nettoTeBetalen),
      werkgeverskost: formatEUR(loonfiche.totalen.werkgeverskostMaand),
    };
  } catch {
    return { netto: "-", werkgeverskost: "-" };
  }
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 850, color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
      <span style={iconTileStyle("var(--color-primary-soft)", "var(--color-primary)")}>{icon}</span>
      {title}
    </div>
  );
}

function LabelWithBadge({ label, badge }: { label: string; badge?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label}
      {badge && <span style={badgeStyle}>{badge}</span>}
    </span>
  );
}

function StatusChip({ label }: { label: string }) {
  return <span style={chipStyle}>{label}</span>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, borderBottom: "1px solid var(--color-navy-50)", paddingBottom: 8 }}>
      <span style={mutedStyle}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 24,
  fontWeight: 850,
  color: "var(--color-text)",
  letterSpacing: 0,
};

const panelStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
};

const mutedStyle: React.CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "9px 10px",
  fontSize: 12,
  color: "var(--color-navy-500)",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  verticalAlign: "middle",
  color: "var(--color-text)",
  whiteSpace: "nowrap",
};

const tdRightStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border)",
  background: "var(--color-navy-50)",
  color: "var(--color-navy-500)",
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 750,
};

const badgeStyle: React.CSSProperties = {
  ...chipStyle,
  borderColor: "var(--color-primary-border)",
  background: "var(--color-primary-soft)",
  color: "var(--color-primary)",
  padding: "2px 6px",
};

const metricStyle: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 110,
  borderRadius: "var(--radius-md)",
  background: "var(--color-navy-50)",
  padding: "10px 12px",
  color: "var(--color-text)",
  fontSize: 12,
};

const smallButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-primary-border)",
  background: "var(--color-surface)",
  color: "var(--color-primary)",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

function iconTileStyle(background: string, color: string): React.CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: "var(--radius-md)",
    background,
    color,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

function buttonStyle(kind: "primary" | "secondary" | "disabled"): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: "var(--radius-md)",
    padding: "8px 13px",
    fontSize: 13,
    fontWeight: 750,
    fontFamily: "var(--font-body)",
    border: "1px solid transparent",
    cursor: kind === "disabled" ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
  };
  if (kind === "primary") {
    return { ...base, background: "var(--color-primary)", color: "#fff", borderColor: "var(--color-primary)" };
  }
  if (kind === "disabled") {
    return { ...base, background: "var(--color-navy-50)", color: "var(--color-text-muted)", borderColor: "var(--color-border)", opacity: 0.72 };
  }
  return { ...base, background: "var(--color-surface)", color: "var(--color-primary)", borderColor: "var(--color-primary-border)" };
}

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(19,31,55,0.42)",
  zIndex: 220,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  overflowY: "auto",
  padding: "34px 18px",
};

const modalStyle: React.CSSProperties = {
  width: "min(960px, 100%)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-lg)",
  padding: 20,
};
