import { CreditCardIcon } from "@phosphor-icons/react/dist/ssr";
import type { Einstellungen } from "@/lib/content/modell";

/** Zahlungsmethoden als Liste mit einem Symbol; Fremdlogos werden bewusst nicht gezeigt. */
export function Zahlungsmethoden({ einstellungen: e }: { einstellungen: Einstellungen }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {e.zahlungsmethoden.map((z) => (
        <li key={z._key} className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-knopf) border border-linie-stark bg-papier px-3 font-semibold">
          <CreditCardIcon size={18} aria-hidden="true" />
          {z.name}
        </li>
      ))}
    </ul>
  );
}
