import { bouwIntegratieExportBatch, integratieExportBatchNaarCsv } from "@/lib/integratieExport";
import type { Loonrun } from "@/lib/loonrun";

export function loonrunNaarCsv(loonrun: Loonrun): string {
    return integratieExportBatchNaarCsv(bouwIntegratieExportBatch(loonrun));
}
