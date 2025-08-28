# 💈 Aplicativo de Agendamento para Barbeiros

> Projeto desenvolvido na disciplina de **Interação Humano-Computador (IHC)**, aplicando **personas**, **cenários de uso**, **princípios e regras de design** e **boas práticas de usabilidade** para criar uma experiência simples, intuitiva e eficiente.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2018.x-informational)]()
[![npm](https://img.shields.io/badge/npm-compatível-informational)]()
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()

---

## 🧭 Sumário
- [💈 Aplicativo de Agendamento para Barbeiros](#-aplicativo-de-agendamento-para-barbeiros)
  - [🧭 Sumário](#-sumário)
  - [📖 Sobre o Projeto](#-sobre-o-projeto)
  - [🧰 Tecnologias](#-tecnologias)
  - [✅ Pré-requisitos](#-pré-requisitos)
  - [🧪 Como executar](#-como-executar)
  - [🗂️ Estrutura do Projeto](#️-estrutura-do-projeto)
  - [🗺️ Roadmap](#️-roadmap)
  - [👥 Equipe](#-equipe)

---

## 📖 Sobre o Projeto
Sistema web para **agendamento de serviços em barbearias**, permitindo que clientes consultem horários, selecionem serviços e confirmem reservas de forma ágil.  
O projeto foi norteado por:
- **Personas e cenários** para guiar requisitos
- **Princípios de design** (consistência, feedback, visibilidade do estado do sistema)
- **Acessibilidade** e **design responsivo**

---

## 🧰 Tecnologias
- **Node.js** (runtime)
- **npm** (gerenciador de pacotes)
- **Vite + React** (interface e DX rápidas) *(ajuste se usarem outra stack)*
- **HTML, CSS e JavaScript/TypeScript**

---

## ✅ Pré-requisitos
- **Node.js 18+** (recomendado)
- **npm 9+**

---

## 🧪 Como executar
- **Primeiro passo vai ter que baixar as depedências** - npm i ou npm install
- **Segundo passo e so inicializar o servidor** - npm run dev

---

## 🗂️ Estrutura do Projeto
```bash
/
├── public/             # Arquivos estáticos
├── src/
│   ├── assets/         # Imagens, ícones, estilos
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas/rotas
│   ├── hooks/          # Hooks customizados (se houver)
│   ├── services/       # Acesso a APIs (se houver)
│   └── utils/          # Funções utilitárias
├── .gitignore          # Arquivos ignorados no Git
├── package.json        # Scripts e dependências
├── vite.config.js      # Configuração do Vite
└── README.md
```

---

## 🗺️ Roadmap
- CRUD de serviços

- Seleção de barbeiro e horários

- Confirmação e lembretes

- Acessibilidade (teclado, alto contraste, ARIA)

- Validações e feedbacks de erro

- Deploy (Vercel/Netlify/etc.)
  
---

## 👥 Equipe
- Guilherme Castilho Machado
- Guilherme Rimoldi Kameoka
- Brunno Fabrício Moraes Viegas

