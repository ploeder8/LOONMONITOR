import type { CSSProperties } from "react";
import { Building2, Car, Euro, Gift, Receipt, Shield, User } from "lucide-react";

import { Banner } from "@/components/Banner";
import { CockpitAccordion } from "@/components/CockpitAccordion";
import { CockpitCard } from "@/components/CockpitCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import type { BrutolocheckResult } from "@/lib/baremas";
import { formatEUR } from "@/lib/money";
import {
  aantalWeekdagenInMaand,
  percentageNaarTewerkstellingsbreuk,
  tewerkstellingsbreukNaarPercentage,
  type BaremaCat,
  type BonusPeriode,
  type GezinsType,
  type Profiel,
  type Schaal,
  type Statuut,
  type StudentenCat,
} from "@/lib/profiel";
import { berekenBaremaInlineCheck } from "@/lib/profielBerekeningen";
import { MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026 } from "@/lib/werkgeverskost";
import { HelpTooltip, NumeriekeInput } from "@/pages/home/FormControls";
import { MobiliteitPaneel } from "@/pages/home/MobiliteitPaneel";
import type { ProfielSetter } from "@/pages/home/types";

function BaremaInlineCheck({ profiel }: { profiel: Profiel }) {
  const result = berekenBaremaInlineCheck(profiel);

  if (result.kind === "error") {
    return (
      <Banner kind="warning" title="Barema-check niet beschikbaar">
        {result.message}
      </Banner>
    );
  }

  return <BaremaInlineCheckCard profiel={profiel} check={result.check} />;
}

function BaremaInlineCheckCard({
  profiel,
  check,
}: {
  profiel: Profiel;
  check: BrutolocheckResult;
}) {
  const isDeeltijds = check.vergelijkingsbasis === "deeltijds_omgerekend";

  return (
    <div style={baremaInlineStyle(check.ok)}>
      <BaremaInlineHeader
        profiel={profiel}
        minimum={check.sectoraalMinimum}
        effectieveErvaring={check.effectieveErvaring}
      />
      {check.ok ? (
        <span>
          {isDeeltijds
            ? "Voltijds equivalent voldoet aan het sectoraal minimum."
            : "Brutoloon voldoet aan het sectoraal minimum."}
        </span>
      ) : (
        <span style={{ fontWeight: 600 }}>
          {isDeeltijds ? "Voltijds equivalent" : "Brutoloon"} ligt{" "}
          {formatEUR(Math.abs(check.verschil))} onder het minimum.
        </span>
      )}
      {isDeeltijds && (
        <span>
          Werkelijk bruto {formatEUR(check.opgegevenBruto)} · voltijds equivalent{" "}
          {formatEUR(check.voltijdsEquivalentBruto)} · pro-rata minimum{" "}
          {formatEUR(check.proRataMinimum)}.
        </span>
      )}
      {check.geclampt && <BaremaClampNote ok={check.ok} />}
    </div>
  );
}

function BaremaInlineHeader({
  profiel,
  minimum,
  effectieveErvaring,
}: {
  profiel: Profiel;
  minimum: number;
  effectieveErvaring: number;
}) {
  const ervaringLabel = profiel.ervaringJaren === effectieveErvaring
    ? `${profiel.ervaringJaren} jaar`
    : `${profiel.ervaringJaren} jaar (barema ${effectieveErvaring} jaar)`;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontWeight: 600 }}>
        Minimum Schaal {profiel.schaal} · Cat {profiel.cat} · {ervaringLabel}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
        {formatEUR(minimum)}
      </span>
    </div>
  );
}

function BaremaClampNote({ ok }: { ok: boolean }) {
  return (
    <span style={{ color: ok ? "var(--color-text-muted)" : "#7f1d1d" }}>
      Loonplafond bereikt: de barematabel gebruikt de hoogste beschikbare ervaring.
    </span>
  );
}

function baremaInlineStyle(ok: boolean): CSSProperties {
  return {
    border: `1px solid ${ok ? "var(--color-border)" : "#fca5a5"}`,
    borderRadius: 8,
    background: ok ? "var(--color-navy-50)" : "#fff1f2",
    color: ok ? "var(--color-navy-500)" : "#991b1b",
    padding: "9px 10px",
    fontSize: 12,
    display: "grid",
    gap: 4,
  };
}

function WieBenJeCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Wie ben je?" icon={<User size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Statuut">
          <select
            className={selectClass}
            value={profiel.statuut}
            onChange={(e) => set("statuut", e.target.value as Statuut)}
          >
            <option value="bediende">Bediende</option>
            <option value="student">Student</option>
          </select>
        </FormField>

        {profiel.statuut === "bediende" ? (
          <>
            <FormField
              label={<>Gezinstype (voor BV) <HelpTooltip text="Een partner is fiscaal niet ten laste. Bij geen of beperkt beroepsinkomen past de BV-berekening Schaal II toe, wat de bedrijfsvoorheffing verlaagt en het geraamde nettoloon verhoogt." /></>}
            >
              <select
                className={selectClass}
                value={profiel.gezinstype}
                onChange={(e) => set("gezinstype", e.target.value as GezinsType)}
              >
                <option value="alleenstaand">Alleenstaand / eenoudergezin</option>
                <option value="gehuwd_met_inkomen">Gehuwd/wettelijk samenwonend - partner met inkomen</option>
                <option value="gehuwd_zonder_inkomen">Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Kinderen ten laste">
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  max={12}
                  value={profiel.kinderenTenLaste}
                  modus="int"
                  onValueChange={(waarde) => set("kinderenTenLaste", waarde)}
                />
              </FormField>
            </div>

            {profiel.gezinstype === "alleenstaand" && profiel.kinderenTenLaste > 0 && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--color-navy-500)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={profiel.fiscaalAlleenstaandeMetKind}
                  onChange={(e) => set("fiscaalAlleenstaandeMetKind", e.target.checked)}
                  style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
                />
                Fiscaal alleenstaande ouder (+€52 BV-vermindering)
              </label>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Categorie">
              <select
                className={selectClass}
                value={profiel.studentenCat}
                onChange={(e) => set("studentenCat", e.target.value as StudentenCat)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </FormField>
            <FormField label="Leeftijd">
              <NumeriekeInput
                className={inputClass}
                min={14}
                max={30}
                value={profiel.studentLeeftijd}
                modus="int"
                onValueChange={(waarde) => set("studentLeeftijd", waarde)}
              />
            </FormField>
          </div>
        )}
      </div>
    </CockpitCard>
  );
}

function ArbeidscontextCard({
  profiel,
  set,
  setBerekeningsMaand,
  setBerekeningsJaar,
}: {
  profiel: Profiel;
  set: ProfielSetter;
  setBerekeningsMaand: (maand: string) => void;
  setBerekeningsJaar: (jaar: string) => void;
}) {
  return (
    <CockpitCard title="Arbeidscontext" icon={<Building2 size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {profiel.statuut === "bediende" && (
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Schaal">
              <select
                className={selectClass}
                value={profiel.schaal}
                onChange={(e) => set("schaal", e.target.value as Schaal)}
              >
                <option value="I">I</option>
                <option value="II">II</option>
              </select>
            </FormField>
            <FormField label="Categorie">
              <select
                className={selectClass}
                value={profiel.cat}
                onChange={(e) => set("cat", e.target.value as BaremaCat)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </FormField>
            <FormField label="Ervaring">
              <NumeriekeInput
                className={inputClass}
                min={0}
                max={60}
                value={profiel.ervaringJaren}
                modus="int"
                onValueChange={(waarde) => set("ervaringJaren", waarde)}
              />
            </FormField>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Maand">
            <select
              className={selectClass}
              value={profiel.berekeningsMaand}
              onChange={(e) => setBerekeningsMaand(e.target.value)}
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maart</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Augustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </FormField>
          <FormField label="Jaar">
            <select
              className={selectClass}
              value={profiel.berekeningsJaar}
              onChange={(e) => setBerekeningsJaar(e.target.value)}
            >
              <option value="2026">2026</option>
            </select>
          </FormField>
          <FormField
            label={<>Werkdagen <HelpTooltip text="Vooringevuld op basis van weekdagen in de gekozen maand. Aanpasbaar voor feestdagen, verlof of afwijkende prestaties." /></>}
          >
            <NumeriekeInput
              className={inputClass}
              min={0}
              max={31}
              value={profiel.arbeidsdagenPerMaand}
              modus="int"
              onValueChange={(waarde) => set("arbeidsdagenPerMaand", waarde)}
            />
          </FormField>
        </div>

        {profiel.statuut === "bediende" && (
          <FormField label="Tewerkstelling (%)">
            <NumeriekeInput
              className={inputClass}
              step="1"
              min={1}
              max={100}
              value={tewerkstellingsbreukNaarPercentage(profiel.tewerkstellingsbreuk)}
              onValueChange={(waarde) =>
                set("tewerkstellingsbreuk", percentageNaarTewerkstellingsbreuk(waarde))
              }
            />
          </FormField>
        )}
      </div>
    </CockpitCard>
  );
}

function BrutoloonCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Brutoloon" icon={<Euro size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {profiel.statuut === "bediende" && profiel.berekeningsRichting === "bruto_naar_netto" ? (
          <FormField label="Brutoloon (€)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              value={profiel.brutoloon}
              onValueChange={(waarde) => set("brutoloon", waarde)}
            />
          </FormField>
        ) : profiel.statuut === "bediende" ? (
          <>
            <FormField label="Gewenst nettoloon (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                value={profiel.doelNettoloon}
                onValueChange={(waarde) => set("doelNettoloon", waarde)}
              />
            </FormField>
            <FormField label="Berekend bruto (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                value={profiel.brutoloon}
                disabled
                onValueChange={() => {}}
              />
            </FormField>
          </>
        ) : (
          <FormField label="Brutoloon (€)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              value={profiel.brutoloon}
              onValueChange={(waarde) => set("brutoloon", waarde)}
            />
          </FormField>
        )}

        {profiel.statuut === "bediende" && <BaremaInlineCheck profiel={profiel} />}

        <FormField
          label={<>Onkostenvergoedingen (€/m) <HelpTooltip text="Vrijgestelde netto-vergoeding: verhoogt nettoloon en werkgeverskost, zonder RSZ/BV-basis te wijzigen." /></>}
        >
          <NumeriekeInput
            className={inputClass}
            step="0.01"
            min={0}
            value={profiel.onkostenvergoedingPerMaand}
            onValueChange={(waarde) => set("onkostenvergoedingPerMaand", waarde)}
          />
        </FormField>

      </div>
    </CockpitCard>
  );
}

function ExtraLooncomponentenContent({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Shield size={14} /> Verzekeringen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField label="Groepsverz. eigen bijdr. (€/m)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              min={0}
              value={profiel.groepsverzekeringEigenBijdrage}
              onValueChange={(waarde) => set("groepsverzekeringEigenBijdrage", waarde)}
            />
          </FormField>
          <FormField label="Hospitalisatie eigen bijdr. (€/m)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              min={0}
              value={profiel.hospitalisatieEigenBijdrage}
              onValueChange={(waarde) => set("hospitalisatieEigenBijdrage", waarde)}
            />
          </FormField>
        </div>
      </div>

      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Receipt size={14} /> Maaltijdcheques
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--color-navy-500)",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <input
              type="checkbox"
              checked={profiel.maaltijdchequesActief}
              onChange={(e) => set("maaltijdchequesActief", e.target.checked)}
              style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
            />
            <span style={{ fontWeight: 600 }}>Maaltijdcheques toepassen</span>
          </label>
          {profiel.maaltijdchequesActief && (
            <>
              <FormField
                label={<>WG-aandeel (€/dag) <HelpTooltip text={`Max €${MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026.toFixed(2).replace(".", ",")}/dag × ${profiel.arbeidsdagenPerMaand} werkdagen.`} /></>}
              >
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  max={MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026}
                  value={profiel.maaltijdchequeWerkgeversaandeelPerDag}
                  onValueChange={(waarde) => set("maaltijdchequeWerkgeversaandeelPerDag", waarde)}
                />
              </FormField>
              <FormField
                label={<>WN-bijdrage (€/dag) <HelpTooltip text={`Min €1,09/dag × ${profiel.arbeidsdagenPerMaand} werkdagen.`} /></>}
              >
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  value={profiel.maaltijdchequeWerknemersbijdragePerDag}
                  onValueChange={(waarde) => set("maaltijdchequeWerknemersbijdragePerDag", waarde)}
                />
              </FormField>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Car size={14} /> VAA werkmiddelen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              label: "Laptop / pc",
              checked: profiel.vaaPcLaptopActief,
              onChange: (v: boolean) => set("vaaPcLaptopActief", v),
            },
            {
              label: "GSM",
              checked: profiel.vaaGsmSmartphoneActief,
              onChange: (v: boolean) => set("vaaGsmSmartphoneActief", v),
            },
            {
              label: "Internet",
              checked: profiel.vaaInternetActief,
              onChange: (v: boolean) => set("vaaInternetActief", v),
            },
            {
              label: "GSM-abonnement",
              checked: profiel.vaaGsmAbonnementActief,
              onChange: (v: boolean) => set("vaaGsmAbonnementActief", v),
            },
          ].map((item) => (
            <label
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-navy-500)",
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Gift size={14} /> Bonus
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField
            label={<>Bonusbedrag (€) <HelpTooltip text="Een maandbedrag wordt omgerekend naar een jaarbonus. De bonus telt alleen mee in het jaaroverzicht en wordt belast als exceptionele vergoeding." /></>}
          >
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              min={0}
              value={profiel.bonusBedrag}
              onValueChange={(waarde) => set("bonusBedrag", waarde)}
            />
          </FormField>
          <div
            role="group"
            aria-label="Bonusperiode"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
            }}
          >
            {([
              ["maand", "Per maand"],
              ["jaar", "Per jaar"],
            ] as Array<[BonusPeriode, string]>).map(([waarde, label]) => (
              <button
                key={waarde}
                type="button"
                aria-pressed={profiel.bonusPeriode === waarde}
                onClick={() => set("bonusPeriode", waarde)}
                style={{
                  border: "1px solid var(--color-primary-border)",
                  borderRadius: "var(--radius-md)",
                  background:
                    profiel.bonusPeriode === waarde
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                  color: profiel.bonusPeriode === waarde ? "#ffffff" : "var(--color-primary)",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "7px 8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WerkgeversbijdragenContent({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
      <FormField
        label={<>Arbeidsongevallen (%) <HelpTooltip text="Burelen: ~0,3%. Controleer uw polis." /></>}
      >
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          max={10}
          value={profiel.arbeidsongevallenPct * 100}
          formatValue={(waarde) => waarde.toFixed(2)}
          onValueChange={(waarde) => set("arbeidsongevallenPct", waarde / 100)}
        />
      </FormField>
      <FormField label="Patronale groepsverzekering (€/m)">
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          value={profiel.extraGroepsverzekering}
          onValueChange={(waarde) => set("extraGroepsverzekering", waarde)}
        />
      </FormField>
      <FormField label="Hospitalisatieverzekering (€/m)">
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          value={profiel.extraHospitalisatie}
          onValueChange={(waarde) => set("extraHospitalisatie", waarde)}
        />
      </FormField>
    </div>
  );
}


// ─── InputCockpit ────────────────────────────────────────────────────────────

export function profielMetBerekeningsMaand(profiel: Profiel, maand: string): Profiel {
  return {
    ...profiel,
    berekeningsMaand: maand,
    arbeidsdagenPerMaand: aantalWeekdagenInMaand(profiel.berekeningsJaar, maand),
  };
}

export function profielMetBerekeningsJaar(profiel: Profiel, jaar: string): Profiel {
  return {
    ...profiel,
    berekeningsJaar: jaar,
    arbeidsdagenPerMaand: aantalWeekdagenInMaand(jaar, profiel.berekeningsMaand),
  };
}

export function InputCockpit({
  profiel,
  set
}: {
  profiel: Profiel;
  set: ProfielSetter;
}) {
  function setBerekeningsMaand(maand: string) {
    set((prev) => profielMetBerekeningsMaand(prev, maand));
  }

  function setBerekeningsJaar(jaar: string) {
    set((prev) => profielMetBerekeningsJaar(prev, jaar));
  }

  function setAlleWoonwerk(actief: boolean) {
    if (actief) {
      set((prev) => ({
        ...prev,
        woonwerkFiets: true,
        woonwerkPrivewagen: false,
        woonwerkBusTramMetro: true,
        woonwerkTrein: true,
      }));
    } else {
      set((prev) => ({
        ...prev,
        woonwerkFiets: false,
        woonwerkPrivewagen: false,
        woonwerkBusTramMetro: false,
        woonwerkTrein: false,
        woonwerkBedrijfswagen: false,
      }));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--cockpit-grid-gap)" }}>
        <WieBenJeCard profiel={profiel} set={set} />
        <ArbeidscontextCard
          profiel={profiel}
          set={set}
          setBerekeningsMaand={setBerekeningsMaand}
          setBerekeningsJaar={setBerekeningsJaar}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--cockpit-grid-gap)" }}>
        <BrutoloonCard profiel={profiel} set={set} />
        <MobiliteitPaneel profiel={profiel} set={set} setAlleWoonwerk={setAlleWoonwerk} />
      </div>

      <CockpitAccordion
        title="Extra looncomponenten"
        subtitle="Verzekeringen, maaltijdcheques, VAA, bonus"
        icon={<Receipt size={16} />}
        defaultOpen
      >
        <ExtraLooncomponentenContent profiel={profiel} set={set} />
      </CockpitAccordion>

      <CockpitAccordion
        title="Werkgeversbijdragen"
        subtitle="Arbeidsongevallen, groepsverzekering, hospitalisatie"
        icon={<Shield size={16} />}
      >
        <WerkgeversbijdragenContent profiel={profiel} set={set} />
      </CockpitAccordion>

    </div>
  );
}
