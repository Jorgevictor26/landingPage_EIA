module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      mensagem: "Método não permitido."
    });
  }

  try {
    const d = req.body || {};
    const dadosAninhados = d?.dados && typeof d.dados === "object" ? d.dados : {};

    console.log("[inscricao] body recebido:", JSON.stringify(d));
    console.log("[inscricao] dadosAninhados:", JSON.stringify(dadosAninhados));
    console.log("[inscricao] GOOGLE_SCRIPT_URL definido:", Boolean(process.env.GOOGLE_SCRIPT_URL));
    console.log("[inscricao] GOOGLE_SCRPIT_URL definido:", Boolean(process.env.GOOGLE_SCRPIT_URL));

    const campos = [
      "nome", "telefone", "email", "curso",
      "frequencia", "modalidade", "horario",
      "dias", "objetivo"
    ];

    const resolved = {};

    for (const campo of campos) {
      const direto = typeof d?.[campo] === "string" ? d[campo].trim() : "";
      const aninhado = typeof dadosAninhados?.[campo] === "string" ? dadosAninhados[campo].trim() : "";
      const valor = direto || aninhado;

      resolved[campo] = valor;

      if (!valor) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Verifica o campo: " + campo
        });
      }
    }

    const googleUrl = process.env.GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRPIT_URL;

    console.log("[inscricao] googleUrl:", googleUrl || "URL ausente");

    if (!googleUrl) {
      throw new Error("Variável GOOGLE_SCRIPT_URL não configurada.");
    }

    const dados = new URLSearchParams();

    for (const campo of campos) {
      const valor = resolved[campo];
      dados.append(campo, valor);
      dados.append(`dados.${campo}`, valor);
    }

    console.log("[inscricao] payload enviado ao Google:", dados.toString());

    const resposta = await fetch(googleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: dados.toString()
    });

    const respostaTexto = await resposta.text();
    console.log("[inscricao] resposta status:", resposta.status);
    console.log("[inscricao] resposta raw:", respostaTexto);

    let resultado;

    try {
      resultado = JSON.parse(respostaTexto);
    } catch {
      resultado = { raw: respostaTexto };
    }

    console.log("[inscricao] resultado parseado:", resultado);

    const sucessoGoogle = resultado?.sucesso === true || resultado?.status === "success";

    if (!resposta.ok || !sucessoGoogle) {
      throw new Error("O Google não confirmou a inscrição.");
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Inscrição registada com sucesso!"
    });

  } catch (erro) {
    console.error("Erro ao registar inscrição:", erro);

    return res.status(502).json({
      sucesso: false,
      mensagem: "Não foi possível confirmar a inscrição."
    });
  }
};
