module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      mensagem: "Método não permitido."
    });
  }

  try {
    const d = req.body;

    const campos = [
      "nome", "telefone", "email", "curso",
      "frequencia", "modalidade", "horario",
      "dias", "objetivo"
    ];

    for (const campo of campos) {
      if (
        typeof d?.[campo] !== "string" ||
        !d[campo].trim()
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Verifica o campo: " + campo
        });
      }
    }

    const dados = new URLSearchParams();

    for (const campo of campos) {
      dados.append(campo, d[campo].trim());
    }

    const resposta = await fetch(
      process.env.GOOGLE_SCRIPT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: dados.toString()
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.sucesso !== true) {
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
