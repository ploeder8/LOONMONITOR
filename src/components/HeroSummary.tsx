import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
interface HeroSummaryProps {
    brutoloon: number;
    nettoloon: number | null;
    werkgeverskost: number | null;
    loonwig: number | null;
}
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2, }: {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}) {
    const [display, setDisplay] = useState(value);
    const hasAnimated = useRef(false);
    useEffect(() => {
        if (hasAnimated.current) {
            setDisplay(value);
            return;
        }
        hasAnimated.current = true;
        const duration = 1200;
        const start = performance.now();
        const from = 0;
        const to = value;
        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            setDisplay(from + (to - from) * eased);
            if (progress < 1)
                requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);
    const formatted = decimals === 0
        ? Math.round(display).toString()
        : display.toLocaleString("nl-BE", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    return (<span>
      {prefix}
      {formatted}
      {suffix}
    </span>);
}
export function HeroSummary({ brutoloon, nettoloon, werkgeverskost, loonwig, }: HeroSummaryProps) {
    const cards = [
        {
            label: "BRUTO",
            value: brutoloon,
            prefix: "€ ",
            suffix: "",
            decimals: 2,
            bg: "var(--hero-bruto-bg)",
            border: "var(--hero-bruto-border)",
            text: "var(--hero-bruto-text)",
            icon: null,
        },
        {
            label: "NETTO",
            value: nettoloon ?? 0,
            prefix: "€ ",
            suffix: "",
            decimals: 2,
            bg: "var(--hero-netto-bg)",
            border: "var(--hero-netto-border)",
            text: "var(--hero-netto-text)",
            icon: null,
        },
        {
            label: "WERKGEVERSKOST",
            value: werkgeverskost ?? 0,
            prefix: "€ ",
            suffix: "",
            decimals: 2,
            bg: "var(--hero-kost-bg)",
            border: "var(--hero-kost-border)",
            text: "var(--hero-kost-text)",
            icon: null,
        },
        {
            label: "LOONWIG",
            value: loonwig !== null ? loonwig * 100 : 0,
            prefix: "",
            suffix: "%",
            decimals: 1,
            bg: "var(--hero-loonwig-bg)",
            border: "var(--hero-loonwig-border)",
            text: "var(--hero-loonwig-text)",
            icon: <TrendingUp size={14}/>,
        },
    ];
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (<div key={card.label} className="rounded-2xl p-4 flex flex-col justify-center" style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                boxShadow: "var(--shadow-sm)",
                minHeight: 90,
            }}>
          <div className="flex items-center gap-1.5 mb-1">
            {card.icon}
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "var(--color-text-muted)" }}>
              {card.label}
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums" style={{
                color: card.text,
                fontFamily: "var(--font-mono)",
                letterSpacing: 0,
            }}>
            <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals}/>
          </span>
        </div>))}
    </div>);
}
