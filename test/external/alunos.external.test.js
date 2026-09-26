import request from "supertest";
import { expect } from "chai";
import { getToken } from "../helpers/auth.js";

describe("Login", () => {
  let token;

  beforeEach(async () => {
    token = await getToken("admin@escola.com", "admin123");
  });

  it("deve cadastrar um aluno quando ele informa dados válidos", async () => {
    const sufixoUnico = Date.now();

    // Cadastrar o aluno
    const cadastroAlunoResposta = await request("http://localhost:3000")
      .post("/api/admin/alunos")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Aline Benjamim",
        email: `${sufixoUnico}.aline.benjamim@example.com`,
        matricula: `2026001-${sufixoUnico}`,
        senha: "123456",
      });
    // Validar que ele foi cadastrado
    expect(cadastroAlunoResposta.status).to.equal(201);
    expect(cadastroAlunoResposta.body.nome).to.equal("Aline Benjamim");
    expect(cadastroAlunoResposta.body.email).to.equal(
      `${sufixoUnico}.aline.benjamim@example.com`,
    );
    expect(cadastroAlunoResposta.body.matricula).to.equal(
      `2026001-${sufixoUnico}`,
    );
  });

  it("deve negar o cadastro de uma aluno quando ele já existe", async () => {
    const cadastroAlunoResposta = await request("http://localhost:3000")
      .post("/api/admin/alunos")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Ana Souza",
        email: "ana.souza@example.com",
        matricula: "2024001",
        senha: "123456",
      });
    // Validar que ele foi cadastrado
    expect(cadastroAlunoResposta.status).to.equal(409);
    expect(cadastroAlunoResposta.body.error).to.equal(
      "Já existe um aluno cadastrado com essa matrícula ou e-mail.",
    );
  });
});
