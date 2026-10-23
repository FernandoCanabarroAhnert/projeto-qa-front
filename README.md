# Sistema de Folha de Pagamento – Front-end

Interface web do Sistema de Folha de Pagamento, desenvolvida no Trabalho Integrador da unidade curricular **Gestão e Qualidade de Software**.

Pela interface, o administrador cadastra, consulta, edita e exclui colaboradores das categorias Padrão, Comissionado e Produção, e gera a folha de pagamento e o relatório resumido. Os cálculos e as validações ficam no back-end; a interface exibe os dados e envia as informações para a API.

## Equipe

- Eduardo Gladzik
- Fernando Canabarro
- Luan Ribeiro
- Pedro Marin

## Tecnologias

- Angular 21 e TypeScript
- Angular Material
- Vitest, para os testes

## Estrutura do projeto

```
src/app        componentes, páginas e serviços de acesso à API
public/        arquivos estáticos, como imagens e ícones
angular.json   configuração do Angular
package.json   dependências do projeto
```

## Como executar

Pré-requisitos: Node.js e Angular CLI instalados, e o [back-end](https://github.com/FernandoCanabarroAhnert/projeto-qa-back) em execução.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie a aplicação:

   ```bash
   ng serve
   ```

3. Acesse `http://localhost:4200` no navegador.

## Testes

```bash
ng test
```

## Build

```bash
ng build
```

Os arquivos gerados ficam na pasta `dist/`.

## Padrões de contribuição

- Cada funcionalidade ou correção é feita em uma branch própria e entra na `main` por pull request revisado por outro integrante.
- Mensagens de commit no padrão `tipo(escopo): descrição`, por exemplo `feat(cadastro): criar formulário de colaborador`. Tipos: `feat`, `fix`, `test`, `docs` e `refactor`.

## Repositórios relacionados

- Back-end: https://github.com/FernandoCanabarroAhnert/projeto-qa-back
