import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from services.clima_service import ClimaService
from services.estimar_colheita_service import EstimarColheitaService


class FakeResponse:
    status_code = 200
    def __init__(self, data, status=200):
        self.data = data
        self.status_code = status
    def json(self):
        return self.data


class TesteClima(unittest.TestCase):
    def setUp(self):
        self.service = ClimaService()
        self.chave = patch.dict(os.environ, {"OPENWEATHER_API_KEY": "chave-teste"})
        self.chave.start()
        self.addCleanup(self.chave.stop)

    def test_vpd_e_condicoes_atuais(self):
        data = {"main": {"temp": 30, "humidity": 50},
                "wind": {"speed": 2.5}, "weather": [{"description": "nublado"}]}
        with patch('services.clima_service.requests.get', return_value=FakeResponse(data)):
            resultado = self.service.executar(-19.92, -43.93)
        self.assertEqual(resultado['temperatura'], 30)
        self.assertAlmostEqual(resultado['deficit_pressao_vapor_kpa'], 2.12, delta=0.02)
        self.assertEqual(resultado['vento_velocidade'], 2.5)

    def test_falta_chave(self):
        with patch.dict(os.environ, {'OPENWEATHER_API_KEY': ''}):
            with self.assertRaisesRegex(ValueError, 'OPENWEATHER_API_KEY'):
                self.service.executar(-19.92, -43.93)

    def test_coordenada_invalida(self):
        with self.assertRaisesRegex(ValueError, 'Coordenadas inválidas'):
            self.service.executar(95, 10)

    def test_previsao_agrupada_por_dia(self):
        dados = {"city": {"timezone": -3*3600}, "list": [
            {"dt": 1791990000, "main": {"temp": 25}, "rain": {"3h": 1.4}},
            {"dt": 1792000800, "main": {"temp": 28}, "rain": {"3h": 0.6}},
            {"dt": 1792087200, "main": {"temp": 19}}
        ]}
        with patch('services.clima_service.requests.get', return_value=FakeResponse(dados)):
            resultado = self.service.executar_previsao(-19.92, -43.93)
        self.assertGreaterEqual(len(resultado['previsao']), 1)
        self.assertEqual(sum(d['amostras'] for d in resultado['previsao']), 3)
        self.assertEqual(sum(d['chuva_prevista_mm'] for d in resultado['previsao']), 2.0)

    def test_estimar_colheita_continua_independente_clima(self):
        s = EstimarColheitaService()
        saida = s.executar('Soja','2026-10-07')
        self.assertEqual(saida['tipo'], 'estimativa_preliminar_sem_clima')
        self.assertLess(saida['inicio_janela'], saida['fim_janela'])


if __name__ == '__main__':
    unittest.main()
