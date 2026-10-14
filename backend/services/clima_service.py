import os
from datetime import datetime, timezone
import requests


class ClimaService:
    """Leituras atuais e previsões de curto prazo do OpenWeather."""

    URL_API = "https://api.openweathermap.org/data/2.5/weather"
    URL_PREVISAO = "https://api.openweathermap.org/data/2.5/forecast"

    def _consultar(self, url, latitude, longitude):
        # Ler a chave no momento da consulta: o app chama load_dotenv()
        # depois da importação do controller de clima.
        api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
        if not api_key:
            raise ValueError("Chave OPENWEATHER_API_KEY não configurada no .env.")

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            raise ValueError("Latitude e longitude devem ser números.")

        if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
            raise ValueError("Coordenadas inválidas: confira latitude e longitude.")

        try:
            resposta = requests.get(
                url,
                params={"lat": latitude, "lon": longitude,
                        "appid": api_key, "units": "metric", "lang": "pt_br"},
                timeout=10
            )
        except requests.exceptions.RequestException as erro:
            raise RuntimeError("Falha de conexão com o OpenWeather.") from erro

        if resposta.status_code == 401:
            raise ValueError("Chave OpenWeather inválida ou ainda não ativada.")
        if resposta.status_code == 404:
            raise ValueError("Dados climáticos não encontrados para as coordenadas.")
        if resposta.status_code != 200:
            raise RuntimeError("O serviço meteorológico está indisponível no momento.")
        try:
            return resposta.json()
        except ValueError as erro:
            raise RuntimeError("Resposta inválida do serviço meteorológico.") from erro

    def executar(self, latitude, longitude):
        """Condições atuais (não é previsão de colheita)."""
        dados = self._consultar(self.URL_API, latitude, longitude)
        clima = (dados.get("weather") or [{}])[0]
        principal = dados.get("main") or {}
        vento = dados.get("wind") or {}
        chuva = dados.get("rain") or {}

        temperatura = principal.get("temp")
        umidade = principal.get("humidity")
        vpd = None
        # Déficit de pressão de vapor, em kPa. Valor instantâneo;
        # não é recomendação de irrigação nem indicador isolado de risco.
        if temperatura is not None and umidade is not None:
            try:
                t, ur = float(temperatura), float(umidade)
                if -80 <= t <= 70 and 0 <= ur <= 100:
                    import math
                    es = 0.6108 * math.exp(17.27 * t / (t + 237.3))
                    vpd = round(es * (1 - ur / 100), 2)
            except (TypeError, ValueError, OverflowError):
                pass

        return {
            "cidade": dados.get("name"),
            "pais": (dados.get("sys") or {}).get("country"),
            "latitude": (dados.get("coord") or {}).get("lat"),
            "longitude": (dados.get("coord") or {}).get("lon"),
            "temperatura": temperatura,
            "sensacao_termica": principal.get("feels_like"),
            "temperatura_minima": principal.get("temp_min"),
            "temperatura_maxima": principal.get("temp_max"),
            "umidade": umidade,
            "pressao": principal.get("pressure"),
            "condicao": clima.get("main"),
            "descricao": clima.get("description"),
            "icone": clima.get("icon"),
            "vento_velocidade": vento.get("speed"),
            "vento_direcao": vento.get("deg"),
            "nebulosidade": (dados.get("clouds") or {}).get("all"),
            "chuva_ultima_hora": chuva.get("1h", 0),
            "nascer_sol": (dados.get("sys") or {}).get("sunrise"),
            "por_sol": (dados.get("sys") or {}).get("sunset"),
            "timezone": dados.get("timezone"),
            "medicao_em_unix": dados.get("dt"),
            "deficit_pressao_vapor_kpa": vpd,
        }

    def executar_previsao(self, latitude, longitude):
        """Agrupa a previsão de 3 em 3 horas por data local (até 4 dias)."""
        dados = self._consultar(self.URL_PREVISAO, latitude, longitude)
        deslocamento_segundos = (dados.get("city") or {}).get("timezone", 0)
        try:
            deslocamento_segundos = int(deslocamento_segundos)
        except (TypeError, ValueError):
            deslocamento_segundos = 0

        dias = {}
        for item in dados.get("list") or []:
            try:
                instante = int(item["dt"]) + deslocamento_segundos
                data_local = datetime.fromtimestamp(instante, tz=timezone.utc).date().isoformat()
                temp = float(item["main"]["temp"])
            except (TypeError, ValueError, KeyError, OverflowError, OSError):
                continue

            dia = dias.setdefault(data_local, {
                "data": data_local,
                "temperatura_minima": temp,
                "temperatura_maxima": temp,
                "chuva_prevista_mm": 0.0,
                "amostras": 0,
            })
            dia["temperatura_minima"] = min(dia["temperatura_minima"], temp)
            dia["temperatura_maxima"] = max(dia["temperatura_maxima"], temp)
            try:
                dia["chuva_prevista_mm"] += float((item.get("rain") or {}).get("3h", 0))
            except (TypeError, ValueError):
                pass
            dia["amostras"] += 1

        hoje_local = datetime.fromtimestamp(
            datetime.now(tz=timezone.utc).timestamp() + deslocamento_segundos,
            tz=timezone.utc
        ).date().isoformat()
        previsao = [dias[dt] for dt in sorted(dias)[:4]]
        for dia in previsao:
            dia["temperatura_minima"] = round(dia["temperatura_minima"], 1)
            dia["temperatura_maxima"] = round(dia["temperatura_maxima"], 1)
            dia["chuva_prevista_mm"] = round(dia["chuva_prevista_mm"], 1)
        return {
            "data_local_hoje": hoje_local,
            "previsao": previsao,
            "aviso": "Valores previstos em intervalos de 3 horas, não medições. Dia atual pode estar incompleto.",
        }
