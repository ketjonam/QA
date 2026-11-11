"""Konvertues notash: nga pikë në notë (shkalla shqiptare 4–10).

Pikët kthehen fillim në përqindje, pastaj në notë sipas shkallës:

    91–100%  →  10  Shkëlqyeshëm
    81–90%   →   9  Shumë mirë
    71–80%   →   8  Mirë
    61–70%   →   7  Kënaqshëm
    51–60%   →   6  Mjaftueshëm
    41–50%   →   5  Kalues
     0–40%   →   4  Dobët

Nota kaluese është 5. Përdorimi:

    python konvertues.py 78
    python konvertues.py 36 50
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass

# Pragu është përqindja minimale që jep atë notë.
SHKALLA: tuple[tuple[int, int, str], ...] = (
    (91, 10, "Shkëlqyeshëm"),
    (81, 9, "Shumë mirë"),
    (71, 8, "Mirë"),
    (61, 7, "Kënaqshëm"),
    (51, 6, "Mjaftueshëm"),
    (41, 5, "Kalues"),
    (0, 4, "Dobët"),
)

NOTA_KALUESE = 5


@dataclass(frozen=True)
class Rezultati:
    """Nota e llogaritur për një rezultat me pikë."""

    pike: float
    maksimumi: float
    perqindja: float
    nota: int
    pershkrimi: str

    @property
    def kalon(self) -> bool:
        return self.nota >= NOTA_KALUESE

    def __str__(self) -> str:
        statusi = "Kalon" if self.kalon else "Nuk kalon"
        return (
            f"{_format_numri(self.pike)}/{_format_numri(self.maksimumi)} pikë "
            f"({self.perqindja:.2f}%) → nota {self.nota} ({self.pershkrimi}). {statusi}."
        )


def piket_ne_note(pike: float, maksimumi: float = 100) -> Rezultati:
    """Kthen notën për `pike` të marra nga `maksimumi` i mundshëm.

    Raises:
        ValueError: nëse maksimumi nuk është pozitiv, ose pikët janë
            jashtë intervalit 0–maksimumi.
    """
    pike = float(pike)
    maksimumi = float(maksimumi)
    if maksimumi <= 0:
        raise ValueError("Maksimumi i pikëve duhet të jetë më i madh se 0.")
    if pike < 0 or pike > maksimumi:
        raise ValueError(f"Pikët duhet të jenë nga 0 deri në {_format_numri(maksimumi)}.")

    perqindja = (pike / maksimumi) * 100
    for pragu, nota, pershkrimi in SHKALLA:
        if perqindja >= pragu:
            return Rezultati(pike, maksimumi, perqindja, nota, pershkrimi)
    raise RuntimeError("Shkalla e notave është e paplotë.")


def _format_numri(vlera: float) -> str:
    if vlera == int(vlera):
        return str(int(vlera))
    return f"{vlera:g}"


def _lexo_numrin(teksti: str) -> float:
    i_pastruar = teksti.strip().replace(",", ".")
    if not i_pastruar:
        raise ValueError("Vendos një numër.")
    try:
        return float(i_pastruar)
    except ValueError as gabimi:
        raise ValueError(f"«{teksti.strip()}» nuk është numër.") from gabimi


def _pyet(mesazhi: str) -> str:
    return input(mesazhi)


def _dialog() -> int:
    print("Konvertues notash (pikë → notë)")
    print("Shkalla: 4 dobët … 10 shkëlqyeshëm. Nota kaluese: 5.")
    print("Shtyp Enter bosh për të dalë.\n")
    while True:
        try:
            pike_tekst = _pyet("Pikët e marra: ").strip()
        except EOFError:
            print()
            return 0
        if not pike_tekst:
            return 0
        try:
            pike = _lexo_numrin(pike_tekst)
            maksimumi_tekst = _pyet("Pikët maksimale [100]: ").strip()
            maksimumi = 100.0 if not maksimumi_tekst else _lexo_numrin(maksimumi_tekst)
            print(piket_ne_note(pike, maksimumi))
            print()
        except ValueError as gabimi:
            print(f"Gabim: {gabimi}\n")


def main(argumentet: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Konverton pikët në notë (shkalla shqiptare 4–10)."
    )
    parser.add_argument(
        "pike",
        nargs="?",
        help="Pikët e marra. Pa këtë argument, programi pyet në tastierë.",
    )
    parser.add_argument(
        "maksimumi",
        nargs="?",
        default="100",
        help="Pikët maksimale (parazgjedhur: 100).",
    )
    te_lexuara = parser.parse_args(argumentet)
    if te_lexuara.pike is None:
        return _dialog()
    try:
        pike = _lexo_numrin(te_lexuara.pike)
        maksimumi = _lexo_numrin(te_lexuara.maksimumi)
        print(piket_ne_note(pike, maksimumi))
    except ValueError as gabimi:
        print(f"Gabim: {gabimi}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
