import { useEffect, useRef, useState, type CSSProperties, type InputHTMLAttributes } from "react";
export function HelpTooltip({ text }: {
    text: string;
}) {
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [pos, setPos] = useState<{
        top: number;
        left: number;
    } | null>(null);
    const show = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({
                top: rect.bottom + 8,
                left: rect.left + rect.width / 2,
            });
        }
        setVisible(true);
    };
    const hide = () => setVisible(false);
    return (<>
      <span ref={triggerRef} className="inline-flex items-center justify-center ml-1 cursor-help align-middle" onMouseEnter={show} onMouseLeave={hide}>
        <span className="text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
          ?
        </span>
      </span>
      {visible && pos && (<span className="fixed -translate-x-1/2 mt-1 w-64 p-2 text-xs rounded shadow-lg" style={{
                top: pos.top,
                left: pos.left,
                backgroundColor: "#1f2937",
                color: "white",
                zIndex: 9999,
            }}>
          {text}
        </span>)}
    </>);
}
type NumeriekeInputModus = "float" | "int";
export function waardeUitNumeriekeInput(invoer: string, modus: NumeriekeInputModus): number | null {
    if (invoer.trim() === "")
        return null;
    const waarde = modus === "int" ? parseInt(invoer, 10) : parseFloat(invoer);
    return Number.isFinite(waarde) ? waarde : null;
}
interface NumeriekeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
    value: number;
    onValueChange: (value: number) => void;
    modus?: NumeriekeInputModus;
    legeWaarde?: number;
    formatValue?: (value: number) => string;
}
export function NumeriekeInput({ value, onValueChange, modus = "float", legeWaarde = 0, formatValue = String, onFocus, onBlur, ...props }: NumeriekeInputProps) {
    const [draft, setDraft] = useState(() => formatValue(value));
    const [heeftFocus, setHeeftFocus] = useState(false);
    useEffect(() => {
        if (!heeftFocus)
            setDraft(formatValue(value));
    }, [formatValue, heeftFocus, value]);
    return (<input {...props} type="number" value={draft} onFocus={(e) => {
            setHeeftFocus(true);
            onFocus?.(e);
        }} onChange={(e) => {
            const volgendeDraft = e.target.value;
            setDraft(volgendeDraft);
            const volgendeWaarde = waardeUitNumeriekeInput(volgendeDraft, modus);
            if (volgendeWaarde !== null)
                onValueChange(volgendeWaarde);
        }} onBlur={(e) => {
            setHeeftFocus(false);
            if (draft.trim() === "") {
                onValueChange(legeWaarde);
                setDraft(formatValue(legeWaarde));
            }
            onBlur?.(e);
        }}/>);
}
export const miniButtonStyle: CSSProperties = {
    border: "1px solid var(--color-primary-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-primary-soft)",
    color: "var(--color-primary)",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 9px",
};
