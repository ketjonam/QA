"""Teste për konvertuesin e pikëve në notë."""

from __future__ import annotations

import unittest

from konvertues import NOTA_KALUESE, Rezultati, main, piket_ne_note


class TestPiketNeNote(unittest.TestCase):
    def test_kufijt_e_shkalles(self) -> None:
        rastet = (
            (0, 4, "Dobët"),
            (40, 4, "Dobët"),
            (40.99, 4, "Dobët"),
            (41, 5, "Kalues"),
            (50, 5, "Kalues"),
            (51, 6, "Mjaftueshëm"),
            (60, 6, "Mjaftueshëm"),
            (61, 7, "Kënaqshëm"),
            (70, 7, "Kënaqshëm"),
            (71, 8, "Mirë"),
            (80, 8, "Mirë"),
            (81, 9, "Shumë mirë"),
            (90, 9, "Shumë mirë"),
            (91, 10, "Shkëlqyeshëm"),
            (100, 10, "Shkëlqyeshëm"),
        )
        for pike, nota, pershkrimi in rastet:
            with self.subTest(pike=pike):
                rezultati = piket_ne_note(pike)
                self.assertEqual(rezultati.nota, nota)
                self.assertEqual(rezultati.pershkrimi, pershkrimi)
                self.assertEqual(rezultati.kalon, nota >= NOTA_KALUESE)

    def test_maksimum_i_ndryshem_nga_100(self) -> None:
        # 36/50 = 72% → nota 8
        rezultati = piket_ne_note(36, 50)
        self.assertEqual(rezultati.nota, 8)
        self.assertAlmostEqual(rezultati.perqindja, 72)
        self.assertTrue(rezultati.kalon)

    def test_presje_dhjetore_dhe_nota_kaluese(self) -> None:
        rezultati = piket_ne_note(20.5, 50)
        self.assertEqual(rezultati.nota, 5)
        self.assertTrue(rezultati.kalon)
        self.assertFalse(piket_ne_note(20, 50).kalon)

    def test_vlera_te_pavlefshme(self) -> None:
        with self.assertRaises(ValueError):
            piket_ne_note(-1)
        with self.assertRaises(ValueError):
            piket_ne_note(101)
        with self.assertRaises(ValueError):
            piket_ne_note(10, 0)
        with self.assertRaises(ValueError):
            piket_ne_note(10, -5)
        with self.assertRaises(ValueError):
            piket_ne_note(51, 50)

    def test_teksti_i_rezultatit(self) -> None:
        teksti = str(piket_ne_note(78))
        self.assertIn("78/100 pikë", teksti)
        self.assertIn("nota 8", teksti)
        self.assertIn("Mirë", teksti)
        self.assertIn("Kalon", teksti)
        self.assertIn("Nuk kalon", str(piket_ne_note(20)))


class TestLinjaEKomandes(unittest.TestCase):
    def test_argumente_te_vlefshme(self) -> None:
        self.assertEqual(main(["85"]), 0)
        self.assertEqual(main(["18,5", "25"]), 0)

    def test_argumente_te_pavlefshme(self) -> None:
        self.assertEqual(main(["abc"]), 1)
        self.assertEqual(main(["120"]), 1)
        self.assertEqual(main(["10", "zero"]), 1)


class TestRezultati(unittest.TestCase):
    def test_eshte_i_pandryshueshem(self) -> None:
        rezultati = piket_ne_note(90)
        self.assertIsInstance(rezultati, Rezultati)
        with self.assertRaises(AttributeError):
            rezultati.nota = 4  # type: ignore[misc]


if __name__ == "__main__":
    unittest.main()
