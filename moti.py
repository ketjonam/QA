"""Përshkruan motin sipas temperaturës në gradë Celsius."""

from __future__ import annotations

import sys


def pershkruaj_motin(temperatura: float) -> str:
    """Kthen si është moti për temperaturën e dhënë në °C.

    Intervalet:
        nën 0 °C   → ngricë
        0–9 °C     → ftohtë
        10–17 °C   → freskët
        18–24 °C   → i këndshëm
        25–31 °C   → nxehtë
        32 °C e lart → shumë nxehtë
    """
    if temperatura < 0:
        return "Ngricë — mot shumë i ftohtë, mund të ketë akull."
    if temperatura < 10:
        return "Ftohtë — vishuni ngrohtë."
    if temperatura < 18:
        return "Freskët — mot i lehtë, mjafton një xhaketë."
    if temperatura < 25:
        return "I këndshëm — mot i mirë për të dalë jashtë."
    if temperatura < 32:
        return "Nxehtë — qëndroni në hije dhe pini ujë."
    return "Shumë nxehtë — shmangni diellin në orët e mesditës."


def lexo_temperaturen(tekst: str) -> float:
    """Kthen temperaturën nga një tekst, p.sh. '22' ose '18,5'."""
    i_pastruar = tekst.strip().replace(",", ".")
    if not i_pastruar:
        raise ValueError("Temperatura mungon.")
    try:
        return float(i_pastruar)
    except ValueError as gabim:
        raise ValueError(
            f"'{tekst}' nuk është temperaturë. Shkruani një numër, p.sh. 21 ose -2.5."
        ) from gabim


def main(argumente: list[str] | None = None) -> int:
    """Lexon temperaturën nga argumenti ose nga tastiera dhe printon motin."""
    argumente = list(sys.argv[1:] if argumente is None else argumente)

    if argumente:
        burimi = argumente[0]
    else:
        burimi = input("Shkruaj temperaturën në °C: ")

    try:
        temperatura = lexo_temperaturen(burimi)
    except ValueError as gabim:
        print(gabim, file=sys.stderr)
        return 1

    print(f"Temperatura: {temperatura:.1f} °C")
    print(f"Moti: {pershkruaj_motin(temperatura)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
