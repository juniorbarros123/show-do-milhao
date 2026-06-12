// ============================================================
// BANCO DE PERGUNTAS - ONBOARDING MCI CAPITAL
// 30 perguntas. O jogo eliminará 1 jogador por rodada a partir da pergunta 3.
// ============================================================

const QUESTIONS = [
  { phase: 1, value: 1000, text: "Qual é a frase principal do onboarding da MCI?", options: ["Resultado vem antes de tudo", "Cultura se vive desde o primeiro dia", "Crescer é vender mais", "Cliente bom é cliente grande"], correct: 1 },
  { phase: 1, value: 1000, text: "Qual é o objetivo central das áreas de apoio da MCI?", options: ["Aumentar reuniões internas", "Libertar o assessor para estar na frente do cliente", "Centralizar tudo no administrativo", "Reduzir o contato com o cliente"], correct: 1 },
  { phase: 1, value: 1000, text: "No Banking PF, quais produtos fazem parte da oferta?", options: ["Conta digital, PIX, cartões, crédito e seguros", "Apenas previdência", "Apenas fundos de investimento", "Apenas câmbio"], correct: 0 },
  { phase: 1, value: 1000, text: "No Corporate, quais são as principais áreas de atuação apresentadas?", options: ["Crédito, ativo judicial, sucessão, imobiliário, M&A e esteira", "Apenas crédito e seguros", "Apenas câmbio e previdência", "Apenas renda fixa e fundos"], correct: 0 },
  { phase: 1, value: 1000, text: "Qual área tem como objetivo gerar demanda e construir autoridade da marca MCI no Nordeste?", options: ["Financeiro", "Marketing", "Jurídico", "Contábil"], correct: 1 },
  { phase: 1, value: 1000, text: "No Banking PF, a integração com investimentos busca:", options: ["Usar investimento como porta de entrada, gerar engajamento Banking e aumentar receita por cliente", "Separar o cliente da plataforma", "Reduzir o cross-sell", "Evitar principalidade"], correct: 0 },
  { phase: 1, value: 1000, text: "Em Corporate, o que é antecipação de recebíveis?", options: ["Quando a empresa adianta valores que tem direito a receber no futuro", "Quando a empresa compra ações", "Quando a empresa contrata seguro de vida", "Quando a empresa abre uma conta digital"], correct: 0 },
  { phase: 1, value: 1000, text: "No ADM/FIN, o que se espera do time comercial em relação às áreas de apoio?", options: ["Que resolva tudo sozinho", "Que use as ferramentas, respeite fluxos, acione as áreas e dê feedback", "Que acione as áreas apenas em último caso", "Que não envolva o administrativo nos processos"], correct: 1 },

  { phase: 2, value: 5000, text: "No Banking PF, o papel do assessor envolve:", options: ["Apenas abertura de conta", "Gestão de relacionamento, geração de receita, cross-sell, retenção e aumento de share of wallet", "Apenas venda de cartão", "Apenas atendimento operacional"], correct: 1 },
  { phase: 2, value: 5000, text: "Em Corporate, o crédito estruturado com garantia é uma modalidade:", options: ["Padronizada e sem análise", "Customizada, podendo ter garantias reais", "Exclusiva para pessoa física", "Sem necessidade de garantia"], correct: 1 },
  { phase: 2, value: 5000, text: "Qual área busca dar visibilidade real do negócio, como margem, receita e eficiência?", options: ["Marketing", "Financeiro", "Jurídico", "Expansão"], correct: 1 },
  { phase: 2, value: 5000, text: "No modelo de receita do Banking PF, qual alternativa está correta?", options: ["Interchange, spread de crédito, float, cross-sell com investimentos e principalidade", "Apenas taxa de corretagem", "Apenas mensalidade de conta", "Apenas receita de câmbio"], correct: 0 },
  { phase: 2, value: 5000, text: "Em sucessão patrimonial, a holding pode ajudar em quais pontos?", options: ["Proteção patrimonial, eficiência tributária e sucessão", "Apenas abertura de conta", "Apenas contratação de cartão", "Apenas antecipação de recebíveis"], correct: 0 },
  { phase: 2, value: 5000, text: "Na PREV MCI, quem pode participar?", options: ["Apenas sócios", "Todos da MCI Capital", "Apenas assessores nível 5", "Apenas líderes"], correct: 1 },
  { phase: 2, value: 5000, text: "No Banking PJ, a integração da conta com os investimentos da empresa gera:", options: ["Gestão financeira completa, melhora na análise de crédito e aumento de receita", "Menor visão sobre o cliente", "Redução da principalidade", "Separação entre banking e investimentos"], correct: 0 },
  { phase: 2, value: 5000, text: "Qual área tem como objetivo proteger a operação e dar segurança para cada negócio fechado?", options: ["Marketing", "Jurídico", "Financeiro", "Expansão"], correct: 1 },

  { phase: 3, value: 20000, text: "Em Corporate, o que é direito creditório?", options: ["Tudo aquilo que alguém tem a receber", "Apenas um imóvel", "Apenas uma conta bancária", "Apenas uma ação de renda variável"], correct: 0 },
  { phase: 3, value: 20000, text: "Qual é a faixa de aporte mensal da PREV MCI?", options: ["De R$ 50 a R$ 100", "De R$ 200 a R$ 700", "De R$ 1.000 a R$ 5.000", "Sem valor mínimo"], correct: 1 },
  { phase: 3, value: 20000, text: "Qual é uma das principais propostas de valor do Banking PF?", options: ["Plataforma 100% digital", "Atendimento exclusivamente físico", "Produtos simples e sem sofisticação", "Separação total entre conta e investimentos"], correct: 0 },
  { phase: 3, value: 20000, text: "No modelo de Partnership, a nota individual considera:", options: ["100% performance", "60% performance e 40% cultura", "50% cultura e 50% tempo de casa", "70% vendas e 30% reuniões"], correct: 1 },
  { phase: 3, value: 20000, text: "Segundo o material de Corporate, o precatório é:", options: ["Uma ordem de pagamento emitida pelo Poder Judiciário para governos pagarem dívidas judiciais definitivas", "Um tipo de cartão empresarial", "Uma linha de crédito sem garantia", "Uma previdência corporativa"], correct: 0 },
  { phase: 3, value: 20000, text: "No plano de saúde da MCI, quem pode participar?", options: ["Apenas sócios", "Todos da MCI Capital", "Apenas líderes", "Apenas assessores comerciais"], correct: 1 },
  { phase: 3, value: 20000, text: "No Partnership, performance tem como base:", options: ["Realizado versus esperado", "Número de eventos internos", "Quantidade de mensagens enviadas", "Tempo de empresa"], correct: 0 },

  { phase: 4, value: 50000, text: "Qual alternativa representa exemplos de garantias em crédito estruturado?", options: ["Imóvel, fluxo de caixa, máquinas, equipamentos e automóveis", "Apenas cartão de crédito", "Apenas saldo em conta", "Apenas assinatura verbal"], correct: 0 },
  { phase: 4, value: 50000, text: "Qual é a idade mínima para concessão do benefício da PREV MCI?", options: ["45 anos", "50 anos", "57 anos", "65 anos"], correct: 2 },
  { phase: 4, value: 50000, text: "Sobre FIP, qual alternativa está correta?", options: ["Pode facilitar sucessão, permitir gestão ativa e ter eficiência tributária", "Sempre tem come-cotas semestral", "É indicado apenas para curto prazo", "Não tem relação com planejamento patrimonial"], correct: 0 },
  { phase: 4, value: 50000, text: "No ciclo de grant do Partnership, em qual ano o participante chega a 100% das cotas?", options: ["Ano 1", "Ano 2", "Ano 3", "Ano 4"], correct: 3 },
  { phase: 4, value: 50000, text: "O que é Home Equity?", options: ["Empréstimo com imóvel em garantia", "Seguro de vida empresarial", "Conta digital PJ", "Fundo de investimento exclusivo"], correct: 0 },
  { phase: 4, value: 50000, text: "Qual é a mensagem central do ciclo de grant?", options: ["Quem entra, já ganha", "Quem fica, ganha. Quem constrói, colhe", "Quem vende, decide sozinho", "Quem indica, recebe tudo"], correct: 1 },
  { phase: 4, value: 1000000, text: "PERGUNTA FINAL: Qual alternativa melhor resume a lógica integrada dos treinamentos?", options: ["As áreas devem funcionar isoladamente, sem conexão com o comercial", "O assessor deve focar apenas em investimentos", "As áreas de apoio dão eficiência, o Banking aumenta relacionamento e principalidade, e o Corporate amplia soluções para demandas mais complexas dos clientes", "O onboarding serve apenas para apresentar organograma"], correct: 2 },
];

const QUESTION_TIME_SECONDS = 15; // tempo igual para todas as perguntas
const TOTAL_SKIPS_PER_PLAYER = 1; // "pular pergunta" - 1x por jogador

// Avatares placeholder (iniciais). Substituir por imagens estilo seleção brasileira / desenho animado.
const AVATAR_PLACEHOLDER = true;
