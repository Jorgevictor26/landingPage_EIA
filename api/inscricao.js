async function enviarEmailConfirmacao({ nome, email }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "English in Action <no-reply@englishinaction.com>";

  if (!apiKey) {
    console.warn("[inscricao] RESEND_API_KEY não configurada. Email de confirmação não enviado.");
    return { ok: false, motivo: "sem_api_key" };
  }

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Recebemos a tua inscrição - English in Action",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1b1b1b; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0b5ea8; margin-bottom: 12px;">Olá ${nome},</h2>
            <p>Recebemos a tua inscrição na English in Action.</p>
            <p>Obrigado por entrares em contacto connosco. Vamos analisar a tua candidatura e entraremos em contacto contigo em breve.</p>
            <p>Enquanto isso, podes continuar a preparar o teu próximo passo para aprender inglês com confiança.</p>
            <p style="margin-top: 24px;">Com os melhores cumprimentos,<br><strong>English in Action</strong></p>
          </div>
        `
      })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      console.error("[inscricao] erro ao enviar email:", resultado);
      return { ok: false, motivo: "resend_error", resultado };
    }

    console.log("[inscricao] email de confirmação enviado:", email);
    return { ok: true };
  } catch (erro) {
    console.error("[inscricao] exceção ao enviar email:", erro);
    return { ok: false, motivo: "exception", erro };
  }
}

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

    const googleUrl = process.env.GOOGLE_SCRIPT_URL;

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

    const emailResultado = await enviarEmailConfirmacao({
      nome: resolved.nome,
      email: resolved.email
    });

    if (!emailResultado.ok) {
      console.warn("[inscricao] inscrição registada, mas email de confirmação não foi enviado:", emailResultado);
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
