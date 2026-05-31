export type Categorie = "lonen" | "rsz" | "fiscaliteit" | "premies_en_voordelen" | "arbeidsvoorwaarden";
export type DatapuntType = "barema" | "parameter" | "cao" | "koninklijk_besluit" | "bronverwijzing";
export type Status = "actief" | "mogelijk_verouderd" | "conflict" | "niet_gevonden" | "gemarkeerd_voor_review";
export type Tier = "Tier 1" | "Tier 2" | "Tier 3" | null;
export type BronType = "overheid" | "sector" | "sociaal_secretariaat" | "vakbond" | "werkgeversorganisatie" | "expert_intermediair" | null;
export type ExtractieMethode = "letterlijk" | "tabel_extractie" | "bronverwijzing" | "gestructureerde_overname" | "samenvattend_met_bronverwijzing" | null;
export type Frequentie = "eenmalig" | "maandelijks" | "jaarlijks" | "per_prestatie" | "wekelijks" | "kwartaal" | null;
export interface BaremaErvaringRij {
    ervaring_jaren: number;
    maandloon_eur: number;
}
export interface BaremaLeeftijdRij {
    leeftijd_jaren: number;
    maandloon_eur: number;
}
export interface TriangulatieItem {
    bron: string;
    url?: string | null;
    tier: Tier;
    overeenstemming?: "100%" | "verwijzing geverifieerd" | "gedeeltelijk";
}
export interface Datapunt {
    id: string;
    categorie: Categorie;
    subcategorie: string;
    type: DatapuntType;
    pc: string;
    omschrijving: string;
    waarde_bron?: string | null;
    waarde_genormaliseerd?: number | null;
    maximum_dagbedrag_genormaliseerd?: number | null;
    maximum_km_per_dag?: number | null;
    tabel_per_ervaring?: BaremaErvaringRij[];
    tabel_per_leeftijd?: BaremaLeeftijdRij[];
    eenheid?: string | null;
    valuta?: "EUR" | null;
    frequentie?: Frequentie;
    berekeningsbasis?: string | null;
    toepassingsgebied?: string[];
    voorwaarden?: string[];
    uitsluitingen?: string[];
    geldig_vanaf?: string | null;
    geldig_tot?: string | null;
    laatst_bevestigd_op: string;
    bron_organisatie?: string | null;
    bron_type?: BronType;
    bron_titel?: string | null;
    bron_url?: string | null;
    bron_publicatiedatum?: string | null;
    bron_vindplaats?: string | null;
    bron_fragment?: string | null;
    betrouwbaarheid?: Tier;
    extractie_methode?: ExtractieMethode;
    triangulatie_bronnen?: TriangulatieItem[];
    normalisatie_toegepast?: boolean;
    normalisatie_opmerking?: string | null;
    status: Status;
    conflict_opmerking?: string | null;
    opmerkingen?: string[];
}
export interface BronMaster {
    bron_id?: string;
    id?: string;
    organisatie: string;
    titel?: string;
    url: string;
    publicatiedatum?: string | null;
    geraadpleegd_op?: string | null;
    tier?: Tier;
    betrouwbaarheid?: Tier;
    type?: BronType;
    rol?: string;
    relevante_categorieen?: string[];
    opmerkingen?: string[];
}
export interface MetaNietGevondenObject {
    onderwerp?: string;
    reden?: string;
    aanbeveling?: string;
}
export interface MetaConflictObject {
    onderwerp?: string;
    beschrijving?: string;
    bronnen?: string[];
}
export interface Meta {
    dataset: string;
    pc: string;
    pc_naam: string;
    land: string;
    taal: string;
    laatste_update: string;
    doeljaar: number;
    datapunten_aantal: number;
    dekking: string[];
    niet_gevonden?: Array<string | MetaNietGevondenObject>;
    conflicten?: Array<string | MetaConflictObject>;
    opmerkingen?: string[];
}
export interface Validatie {
    json_schema_gevolgd: boolean;
    alle_datapunten_met_bron: boolean;
    alle_datapunten_met_status: boolean;
    conflicten_gemarkeerd: boolean;
    ontbrekende_informatie_gemarkeerd: boolean;
    baremamatrix_volledig_geintegreerd: boolean;
    baremacellen_aantal: number;
    triangulatie_uitgevoerd: boolean;
    monotone_loonprogressie_gecheckt: boolean;
    sectorpensioen_onderzocht?: boolean;
    sociaal_fonds_200_bijdrage_geintegreerd?: boolean;
}
export interface Dataset {
    meta: Meta;
    lonen: Datapunt[];
    rsz: Datapunt[];
    fiscaliteit: Datapunt[];
    premies_en_voordelen: Datapunt[];
    arbeidsvoorwaarden: Datapunt[];
    bronnen: BronMaster[];
    validatie: Validatie;
}
export type DatapuntCategorie = Exclude<Categorie, never>;
