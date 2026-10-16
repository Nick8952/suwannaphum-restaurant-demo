import { PepperIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Schärfe als ein bis drei Chilis, wie auf der gedruckten Karte. Die Bedeutung steht für Screenreader als Text daneben
 * («Schärfe: scharf, 2 von 3»); Farbe allein trägt keine Information.
 */
export function Chilis({ grad, stufen, label }: { grad: number; stufen: { grad: number; text: string }[]; label: string }) {
  if (grad < 1) return null;
  const text = stufen.find((s) => s.grad === grad)?.text ?? `${grad} von 3`;
  return (
    <span className="chilis" title={`${label}: ${text}`}>
      {Array.from({ length: grad }, (_, i) => <PepperIcon key={i} size={15} weight="fill" aria-hidden="true" />)}
      <span className="nur-sr">{label}: {text}, {grad} von 3</span>
    </span>
  );
}
