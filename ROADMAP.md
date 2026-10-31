# Roadmap do fork

Fork de [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) (MIT). Meta de longo prazo: cobrir o que a Higgsfield faz, **rodando local de graça quando o PC aguenta** e usando **a chave de API do próprio usuário** quando não aguenta.

Princípios:
- **Local primeiro.** Modo local é o padrão; API é opcional.
- **Sem amarra a fornecedor.** Qualquer provedor (fal, Replicate, Google, MuAPI…) entra com a chave do usuário.
- **Preço transparente.** Antes de gerar, o app mostra: "local: grátis (~X min)" × "API: ~US$ Y".
- **Não quebrar em silêncio.** Se falta RAM, VRAM, DLL ou modelo, o app diz o que fazer em vez de travar.
- **Em português** por padrão (inglês continua).

Levantamento da Higgsfield feito em 31/10/2026 (site, changelog, blog). Itens marcados (?) não foram confirmados em fonte primária.

---

## Prioridades

### P0 — Motor local à prova de falha (melhoria 1)
Problemas reais achados na v2.0.0 (Windows, RTX 2060 12 GB, 16 GB RAM):

| # | Problema | Onde | Correção |
|---|---|---|---|
| 1 | Baixa a build **CPU** do sd.cpp mesmo com GPU NVIDIA (ordem de preferência põe `avx2` antes de `cuda12`) | `electron/lib/localInferenceAssets.js:12-19` | Detectar GPU NVIDIA (`nvidia-smi`) e preferir build CUDA |
| 2 | Build CUDA vem sem `cudart64_12`, `cublas64_12`, `cublasLt64_12` → cai pra CPU e trava sem RAM | `electron/lib/localInference.js:233-324` | Baixar também `cudart-sd-bin-win-cu12-x64.zip` da mesma release e extrair em `bin/` |
| 3 | Download não segue redirect **relativo** ("Invalid URL") e perde a porta | `localInference.js:81,91,98` | Resolver `Location` com `new URL(loc, base)` |
| 4 | URL do FLUX VAE quebrou (repo renomeado `Comfy-Org/z_image_turbo` → `Comfy-Org/Z-Image-Turbo`) | `electron/lib/modelCatalog.js:13-18` | Atualizar URL (e o item 3 evita a próxima quebra) |
| 5 | Nenhuma checagem de RAM/VRAM antes de rodar modelo pesado | — | Ler RAM (`os.totalmem/freemem`) e VRAM (`nvidia-smi`), comparar com requisito do catálogo, avisar/bloquear com sugestão (modelo menor, quantização, API) |
| 6 | Wan2GP: modelos "(Wan2GP)" Unavailable na v2.0.0 (procurava endpoints Gradio por nome) | `electron/lib/wan2gp*.js` | O `main` já troca por `wgp.py --process` (modo pasta) e MCP. **Validar** com o WanGP v18 instalado em `C:\Users\helle\Wan2GP` |

### P1 — Base do produto
- **Provedores plugáveis.** Hoje a MuAPI está fixa em ~10 lugares (`packages/studio/src/muapi.js`, `src/lib/muapi.js`, proxies em `app/api/*`, `middleware.js`, `vite.config.mjs`) e não existe camada de provedor. Criar uma interface mínima (gerar, consultar status, upload, custo) e adaptadores: local (sd.cpp / Wan2GP), MuAPI, fal, Replicate, Google (Gemini/Veo). Chave de cada provedor salva localmente.
- **Preço transparente.** Mostrar custo estimado por geração (o código já tem `estimateV2VCost` sem uso) e comparar com o local.
- **UI em português + local como padrão.** Hoje existem só `en` e `zh` (≈960 textos no app web, ≈390 no Electron). Adicionar `pt-BR`.
- **Decidir qual frontend é "o app".** Existem dois: o Electron (`src/`, JS puro, menos estúdios) e o web Next (`packages/studio`, React, todos os estúdios). Recomendação: o Electron passa a carregar o estúdio React, pra não manter tudo em dobro.

### P2 — Personagem salvo (equivalente ao Soul ID)
- **Character sheet** reutilizável: frente, lado, perfil, corpo inteiro + nome, descrição, estilo. Usar o personagem com `@nome` em qualquer estúdio (imagem, vídeo, lip sync).
- Local: gerar as vistas com Qwen Image Edit Plus / Flux Kontext (já no Wan2GP) e manter identidade em vídeo com Lynx / referências. API: Nano Banana, Kling refs, etc.
- Depois: treino de LoRA local do personagem (o Soul ID da Higgsfield pede 20+ fotos e treina).

### P3 — Paridade com a Higgsfield (ordem sugerida)
1. Lip sync / avatar falante local (InfiniteTalk, MultiTalk, Hunyuan/LongCat Avatar já instalados no Wan2GP).
2. Upscale local de imagem e vídeo.
3. Biblioteca de movimentos de câmera (presets nomeados em PT).
4. Efeitos/presets virais e transições.
5. Edição de imagem: inpaint, relight, remover fundo/objeto, troca de roupa.
6. Multi-ângulo a partir de 1 imagem.
7. Voz: TTS e troca de voz local.

---

## Higgsfield × este app

Legenda: ✅ tem · 🟡 parcial / só via MuAPI · ❌ não tem

| Recurso Higgsfield | O que faz | No app hoje | Prioridade |
|---|---|---|---|
| **Soul ID** | Identidade treinada com 20+ fotos, mesmo rosto em tudo | ❌ (há `flux-pulid` e upload de referência, sem personagem salvo) | P2 |
| Soul 2.0 + Moodboards / Soul Hex | Modelo próprio de foto, referências de estilo, paleta | ❌ | depois |
| Soul Photodump | 15 fotos do mesmo personagem em poses/lugares | ❌ | P2 |
| AI Influencer Studio | Criar persona e colocar em vídeo | 🟡 `AiInfluencerStudio.jsx` (só monta prompt, não guarda identidade) | P2 |
| AI Cast / `@personagem` | Atores reutilizáveis com emoções | ❌ | P2 |
| Popcorn | Storyboard mantendo identidade quadro a quadro | ❌ | P3 |
| Angles 2.0 / Shots | Novos ângulos / 9 planos a partir de 1 imagem | ❌ | P3 |
| Geração de imagem (Nano Banana, GPT Image, Seedream, FLUX…) | Vários modelos | 🟡 via MuAPI; local: Z-Image, SD 1.5/SDXL, FLUX (Wan2GP) | P0/P1 |
| Inpaint / Draw to Edit | Editar com pincel | 🟡 `DrawModal.jsx` + `LayersStudio.jsx` via MuAPI | P3 |
| Relight, Expand, Object/Background Remover, Color Grading | Apps de edição | 🟡 catálogo Apps via MuAPI | P3 |
| Face Swap, Character Swap | Trocar rosto/personagem | 🟡 `RecastStudio.jsx` (body swap) via MuAPI | P3 |
| Outfit Swap, AI Stylist | Provador virtual | ❌ | P3 |
| Vídeo: Kling, Veo, Sora, Seedance, Wan, MiniMax | Texto/imagem → vídeo, 1º/último quadro | 🟡 via MuAPI; local: Wan 2.1/2.2, Hunyuan, LTX (Wan2GP) | P0/P1 |
| Motion control (referência de vídeo) | Copiar movimento de um vídeo | 🟡 `MotionControlStudio.jsx` via MuAPI | P3 |
| Cinema Studio 4.0 | Câmera, lente, abertura, 30+ movimentos, áudio | 🟡 `CinemaStudio` (câmera/lente/focal) | P3 |
| Genjutsu / Restyle | Trocar objeto/personagem/estilo em vídeo | ❌ | depois |
| **Camera Controls** (~65 presets) | Crash zoom, dolly, FPV, bullet time… | 🟡 controles de câmera no Cinema, sem biblioteca de presets | P3 |
| Effects / Viral Presets | Foto → vídeo com efeito pronto | 🟡 `VibeMotionStudio.jsx` via MuAPI | P3 |
| **Lip sync** | Imagem/vídeo + áudio → fala | 🟡 `LipSyncStudio` via MuAPI | P3 (local) |
| Higgsfield Audio | TTS, troca de voz, tradução com lip sync | 🟡 `AudioStudio.jsx` via MuAPI | P3 |
| Marketing Studio / Ad Reference / UGC | Produto + avatar → anúncio | 🟡 `MarketingStudio.jsx` via MuAPI | depois |
| Canvas | Quadro de nós (workflow) | ✅ `WorkflowStudio` (Vibe-Workflow) | — |
| Supercomputer (agente) | Agente que pesquisa, cria, publica | 🟡 `AgentStudio`, `DesignAgentStudio` | depois |
| MCP / CLI / plugins | Integração com outros apps | 🟡 `McpCliStudio` (MCP da MuAPI) | depois |
| **Upscale** imagem/vídeo | Até 4K, interpolação 60 fps | 🟡 só como modelo MuAPI | P3 |
| Edição em timeline | — | ❌ (Higgsfield também não tem (?)) | — |
| Preço | Créditos; planos ~US$19–129/mês (?) | Saldo MuAPI no topo; sem custo por geração | P1 |

---

## Melhorias já pedidas (resumo)
1. Motor local à prova de falha — **P0** (tabela acima).
2. Wan2GP funcionando com o WanGP atual — **P0**.
3. Checagem de RAM/VRAM — **P0**.
4. Personagem salvo — **P2**.
5. Provedores plugáveis com a chave do usuário — **P1**.
6. UI em português, local como padrão, preço local × API — **P1**.

## Perguntas em aberto
- Nome/marca do projeto (repo pode ser renomeado sem quebrar links).
- Qual frontend vira o principal (ver P1).
- Manter compatibilidade com o upstream (puxar novidades dele) ou divergir?
