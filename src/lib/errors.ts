export class PC200DatasetError extends Error {
    datapuntId?: string;
    constructor(message: string, datapuntId?: string) {
        super(message);
        this.name = "PC200DatasetError";
        this.datapuntId = datapuntId;
    }
}
export class DatapuntOnbekend extends PC200DatasetError {
    constructor(datapuntId: string) {
        super(`Datapunt onbekend: ${datapuntId}`, datapuntId);
        this.name = "DatapuntOnbekend";
    }
}
export class DatapuntNietBruikbaar extends PC200DatasetError {
    reden: string;
    constructor(datapuntId: string, reden: string) {
        super(`${datapuntId}: ${reden}`, datapuntId);
        this.name = "DatapuntNietBruikbaar";
        this.reden = reden;
    }
}
export class DatapuntNietGeldigOpDatum extends PC200DatasetError {
    refDatum: string;
    geldigVanaf?: string | null;
    geldigTot?: string | null;
    constructor(datapuntId: string, refDatum: string, geldigVanaf?: string | null, geldigTot?: string | null) {
        super(`${datapuntId} niet geldig op ${refDatum} (geldig: ${geldigVanaf ?? "—"} → ${geldigTot ?? "open"})`, datapuntId);
        this.name = "DatapuntNietGeldigOpDatum";
        this.refDatum = refDatum;
        this.geldigVanaf = geldigVanaf;
        this.geldigTot = geldigTot;
    }
}
export class BaremaBuitenSchaalError extends PC200DatasetError {
    constructor(message: string, datapuntId?: string) {
        super(message, datapuntId);
        this.name = "BaremaBuitenSchaalError";
    }
}
