# SAEP Barbearia

Sistema web de gestão e agendamento para barbearia: login, painel, clientes (com busca), barbeiros, serviços e agendamentos sem choque de horário.

Documentação em [`docs/documentacao.md`](docs/documentacao.md) e DER em [`docs/der.png`](docs/der.png).

## Como rodar

```bash
pip install -r sistema/requirements.txt
sqlite3 saep.db < saep_db.sql
cd sistema && python app.py
```

Login de teste: `ana` / `ana123`.

## Estrutura

```
saep_db.sql            criação e população do banco
docs/                  documentação e DER
sistema/               código-fonte (app.py, crypto.py, config.py, templates/, static/)
scripts/gerar_seed.py  gera o saep_db.sql com os dados já criptografados
```

Para alterar a massa de dados, edite `scripts/gerar_seed.py`, execute-o novamente e recrie o banco.
