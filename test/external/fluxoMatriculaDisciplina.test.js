import { api } from "../helpers/api.js";
import { expect } from "chai";
import { comTokenDeAdmin, getToken } from "../helpers/auth.js";
import { novoAluno } from "../factories/alunosFactory.js";
import { novaDisciplina } from "../factories/disciplinasFactory.js";
import testesDeMatriculas from "../fixtures/matriculas.json" with { type: "json" };

describe("Matrícula de aluno em disciplina", () => {
  it("Validar que um aluno que acaba de ser cadastrado pode ser maticulado em uma nova disciplina", async () => {
    const cadastroAlunoResposta = await api()
      .post("/api/admin/alunos")
      .set("Content-Type", "application/json")
      .set("Authorization", await comTokenDeAdmin())
      .send(novoAluno());

    const alunoId = cadastroAlunoResposta.body.id;

    const cadastroDisciplinaResposta = await api()
      .post("/api/admin/disciplinas")
      .set("Content-Type", "application/json")
      .set("Authorization", await comTokenDeAdmin())
      .send(novaDisciplina());

    const disciplinaId = cadastroDisciplinaResposta.body.id;

    const cadastroDaMatriculaResposta = await api()
      .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
      .set("Content-Type", "application/json")
      .set("Authorization", await comTokenDeAdmin())
      .send({
        alunoId: alunoId,
      });

    expect(cadastroDaMatriculaResposta.status).to.equal(201);
    expect(cadastroDaMatriculaResposta.body.alunoId).to.equal(alunoId);
    expect(cadastroDaMatriculaResposta.body.disciplinaId).to.equal(
      disciplinaId,
    );
  });

  testesDeMatriculas.forEach((testeDeMatricula) => {
    it(testeDeMatricula.testTitle, async () => {
      const sufixoUnico = Date.now();

      const dadosAlunoUnico = {
        nome: testeDeMatricula.dadosAluno.nome,
        senha: testeDeMatricula.dadosAluno.senha,
        email: `${sufixoUnico}.${testeDeMatricula.dadosAluno.email}`,
        matricula: `${testeDeMatricula.dadosAluno.matricula}-${sufixoUnico}`,
      };

      const dadosDisciplinaUnica = {
        nome: testeDeMatricula.dadosDisciplina.nome,
        cargaHoraria: testeDeMatricula.dadosDisciplina.cargaHoraria,
        codigo: `${testeDeMatricula.dadosDisciplina.codigo}-${sufixoUnico}`,
      };

      const cadastroAlunoResposta = await api()
        .post("/api/admin/alunos")
        .set("Content-Type", "application/json")
        .set("Authorization", await comTokenDeAdmin())
        .send(dadosAlunoUnico);

      const alunoId = cadastroAlunoResposta.body.id;

      const cadastroDisciplinaResposta = await api()
        .post("/api/admin/disciplinas")
        .set("Content-Type", "application/json")
        .set("Authorization", await comTokenDeAdmin())
        .send(dadosDisciplinaUnica);

      const disciplinaId = cadastroDisciplinaResposta.body.id;

      const cadastroDaMatriculaResposta = await api()
        .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
        .set("Content-Type", "application/json")
        .set("Authorization", await comTokenDeAdmin())
        .send({
          alunoId: alunoId,
        });

      expect(cadastroDaMatriculaResposta.status).to.equal(
        testeDeMatricula.statusCodeEsperado,
      );
      expect(cadastroDaMatriculaResposta.body.alunoId).to.equal(alunoId);
      expect(cadastroDaMatriculaResposta.body.disciplinaId).to.equal(
        disciplinaId,
      );

      // login como o aluno recém-cadastrado
      const tokenDoAluno = await getToken(
        dadosAlunoUnico.email,
        dadosAlunoUnico.senha,
      );

      // registrar a entrega do trabalho como o próprio aluno
      const registroDoTrabalhoResposta = await api()
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${tokenDoAluno}`)
        .send({
          disciplinaId: disciplinaId,
          titulo: testeDeMatricula.dadosTrabalho.titulo,
          descricao: testeDeMatricula.dadosTrabalho.descricao,
        });

      expect(registroDoTrabalhoResposta.status).to.equal(201);
      expect(registroDoTrabalhoResposta.body.alunoId).to.equal(alunoId);
      expect(registroDoTrabalhoResposta.body.disciplinaId).to.equal(
        disciplinaId,
      );
      expect(registroDoTrabalhoResposta.body.titulo).to.equal(
        testeDeMatricula.dadosTrabalho.titulo,
      );
    });
  });
});
