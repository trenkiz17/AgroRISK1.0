// Indicadores de calendário da safra — referência demonstrativa do TCC.
// Mesma regra preliminar do backend/services/estimar_colheita_service.py.
// NÃO usa previsão de tempo para afirmar maturação/colheita realizada.
const AgroRiskIndicadores = (() => {
    const UM_DIA = 86400000;

    function dataUTC(valor) {
        if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
        const [ano, mes, dia] = valor.split("-").map(Number);
        const data = new Date(Date.UTC(ano, mes - 1, dia));
        if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null;
        return data;
    }

    function isoUTC(data) {
        return data.toISOString().slice(0, 10);
    }

    function adicionarAnos(data, anos) {
        const resultado = new Date(data.getTime());
        const dia = resultado.getUTCDate();
        resultado.setUTCDate(1);
        resultado.setUTCFullYear(resultado.getUTCFullYear() + anos);
        const ultimoDia = new Date(Date.UTC(resultado.getUTCFullYear(), resultado.getUTCMonth() + 1, 0)).getUTCDate();
        resultado.setUTCDate(Math.min(dia, ultimoDia));
        return resultado;
    }

    function janela(safra) {
        const plantio = dataUTC(safra?.data_plantio);
        if (!plantio) return null;
        const cultura = String(safra?.cultura || "").trim().toLowerCase();
        let inicio;
        let fim;
        if (cultura === "café" || cultura === "cafe") {
            inicio = adicionarAnos(plantio, 3);
            fim = adicionarAnos(plantio, 4);
        } else if (cultura === "milho" || cultura === "soja") {
            const dias = cultura === "milho" ? [110, 150] : [100, 140];
            inicio = new Date(plantio.getTime() + dias[0] * UM_DIA);
            fim = new Date(plantio.getTime() + dias[1] * UM_DIA);
        } else {
            return null;
        }
        return {inicio: isoUTC(inicio), fim: isoUTC(fim),
            aviso: "Faixa preliminar baseada no ciclo da cultura; não é previsão meteorológica de longo prazo."};
    }

    function situacao(safra, hojeISO) {
        const salvo = String(safra?.status || "Planejamento").trim().toLowerCase();
        const faixa = janela(safra);
        const agora = new Date();
        const dataLocal = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
        const hoje = dataUTC(hojeISO) || dataUTC(dataLocal);
        const hojeStr = isoUTC(hoje);
        if (salvo.includes("final") || salvo.includes("conclu") || salvo.includes("colhid")) {
            return {status: "Finalizada", detalhe: "Colheita declarada como concluída no cadastro.", janela: faixa};
        }
        if (!faixa) {
            return {status: salvo.includes("andamento") ? "Em andamento" : "Planejamento",
                detalhe: "Dados insuficientes para estimar uma janela de colheita.", janela: null};
        }
        if (hojeStr < safra.data_plantio) {
            return {status: "Planejamento", detalhe: "Data de plantio ainda não chegou.", janela: faixa};
        }
        if (hojeStr < faixa.inicio) {
            return {status: "Em andamento", detalhe: "Ainda antes da janela preliminar de colheita.", janela: faixa};
        }
        if (hojeStr <= faixa.fim) {
            return {status: "Na janela prevista", detalhe: "Período estimado de colheita. Confirme a maturação no campo.", janela: faixa};
        }
        return {status: "Janela encerrada", detalhe: "A janela estimada passou. Isso não confirma que houve colheita.", janela: faixa};
    }

    function mesAno(dataISO) {
        const data = dataUTC(dataISO);
        return data ? new Intl.DateTimeFormat("pt-BR", {
            month: "long", year: "numeric", timeZone: "UTC"
        }).format(data) : "indisponível";
    }

    return {janela, situacao, mesAno};
})();
