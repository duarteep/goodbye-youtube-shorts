# 👋 Goodbye YouTube Shorts

Uma extensão leve para o Chrome que remove completamente os **Shorts** do YouTube — tanto os links na barra lateral quanto as sugestões no feed.

## ✨ O que faz

- **Remove o link "Shorts"** da barra lateral e do mini menu
- **Remove seções de Shorts** (prateleiras e sugestões) da página inicial
- **Funciona em tempo real** — monitora mudanças no DOM para garantir que os Shorts permaneçam ocultos durante a navegação

## 🛠 Tecnologias

- Manifest V3
- Content Script com `MutationObserver`
- JavaScript puro — sem dependências externas

## 📦 Instalação (modo desenvolvedor)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/goodbye-yt-shorts.git
   ```
2. Abra `chrome://extensions/` no navegador
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação**
5. Selecione a pasta `goodbye-yt-shorts-extension`

## 📂 Estrutura

```
goodbye-yt-shorts-extension/
├── manifest.json      # Configuração da extensão (Manifest V3)
├── content.js         # Script principal — remove Shorts do DOM
├── popup.html         # Interface do popup da extensão
├── popup.js           # Lógica do popup (status ativo/inativo)
├── icon16.png         # Ícone 16x16
├── icon48.png         # Ícone 48x48
└── icon128.png        # Ícone 128x128
```

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este projeto segue o **GitHub Flow** — um modelo simples e eficiente de trabalho com Git.

### 🔀 Gitflow (GitHub Flow)

A branch `main` é a branch principal e deve estar **sempre estável**. Toda mudança entra via **Pull Request**.

```
main (sempre deployable)
 ├── feature/nova-funcionalidade
 ├── fix/corrige-bug-x
 └── chore/atualiza-readme
```

#### Convenção de branches

| Prefixo | Uso |
|---|---|
| `feature/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `chore/` | Manutenção, docs, refatoração |

#### Passo a passo

1. **Fork** este repositório
2. Crie uma **branch** a partir de `main` com o prefixo adequado:
   ```bash
   git checkout main && git pull
   git checkout -b feature/minha-feature
   ```
3. Faça suas alterações e **commit** seguindo o padrão de mensagens:
   ```bash
   git commit -m "feat: adiciona minha feature"
   ```
4. Envie para o seu fork:
   ```bash
   git push -u origin feature/minha-feature
   ```
5. Abra um **Pull Request** neste repositório
6. Aguarde o **CI passar** (validação automática via GitHub Actions)
7. Após aprovação e merge, a branch pode ser deletada

#### 📝 Convenção de commits

| Prefixo | Exemplo |
|---|---|
| `feat:` | `feat: adiciona modo escuro no popup` |
| `fix:` | `fix: corrige shorts não sendo ocultados` |
| `chore:` | `chore: atualiza README` |
| `refactor:` | `refactor: simplifica lógica do MutationObserver` |

### ⚙️ CI/CD (GitHub Actions)

O projeto possui pipelines automatizados que rodam no plano **gratuito** do GitHub Actions:

| Workflow | Trigger | O que faz |
|---|---|---|
| **CI** | Push em `main` + PRs | Valida `manifest.json` + lint do JavaScript |
| **Release** | Tags `v*` | Gera `.zip` da extensão + cria GitHub Release |

> O CI roda automaticamente em cada Pull Request. Certifique-se de que os checks passaram antes de solicitar review.

### 🚀 Releases

Para criar uma nova release:

```bash
git checkout main && git pull
git tag v1.3.0
git push --tags
```

O workflow de Release irá automaticamente:
1. Empacotar a extensão em um `.zip`
2. Criar uma **GitHub Release** com release notes geradas automaticamente

### 💡 Dicas para contribuir

- Mantenha o código simples e sem dependências externas
- Teste suas alterações carregando a extensão localmente antes de abrir o PR
- Descreva claramente o que sua alteração faz e por quê
- Siga a convenção de branches e commits descrita acima

## 🐛 Issues

Encontrou um bug ou tem uma sugestão? Abra uma [Issue](../../issues) no GitHub!

Ao criar uma issue, tente incluir:

- **Descrição clara** do problema ou sugestão
- **Passos para reproduzir** (no caso de bugs)
- **Versão do navegador** que está usando
- **Capturas de tela**, se possível

Toda contribuição conta — desde reportar um bug até sugerir uma melhoria. 🙌

## 📄 Licença

MIT
