/**
 * GEF SaaS - Arquivo de Lógica Comum e Utilitários Globais
 * Configuração Supabase, PWA Service Worker, Gestão de Sessão e Abstração do Schema
 */

// ==========================================
// 1. CONFIGURAÇÃO SUPABASE ÚNICA
// ==========================================
const SUPABASE_URL = 'https://cxhpmexiohzxgokuxajk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHBtZXhpb2h6eGdva3V4YWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjI1MzUsImV4cCI6MjEwNDUzODUzNX0.XNS-fheKlqmnvn9YlCaO5us79AY4yt_nIThDbCx_sFM';

// Suporta credenciais salvas dinamicamente em tempo de teste sem alterar o arquivo
const SAVED_URL = localStorage.getItem('GEF_CUSTOM_SUPABASE_URL');
const SAVED_KEY = localStorage.getItem('GEF_CUSTOM_SUPABASE_KEY');

const ACTIVE_SUPABASE_URL = (SAVED_URL && SAVED_URL.trim() !== '') ? SAVED_URL : SUPABASE_URL;
const ACTIVE_SUPABASE_KEY = (SAVED_KEY && SAVED_KEY.trim() !== '') ? SAVED_KEY : SUPABASE_KEY;

let supabaseInstance = null;
const isSupabaseConfigured = ACTIVE_SUPABASE_URL !== 'SUA_URL' && ACTIVE_SUPABASE_KEY !== 'SUA_KEY';

if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient && isSupabaseConfigured) {
  try {
    supabaseInstance = window.supabase.createClient(ACTIVE_SUPABASE_URL, ACTIVE_SUPABASE_KEY);
    console.log('[GEF SaaS] Supabase Conectado:', ACTIVE_SUPABASE_URL);
  } catch (err) {
    console.error('[GEF SaaS] Erro ao conectar Supabase:', err);
  }
}

// Exportação solicitada explicitamente
const supabase = supabaseInstance;

// ==========================================
// 2. REGISTRO DO PWA (SERVICE WORKER)
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[GEF SaaS PWA] Service Worker registrado no escopo:', reg.scope);
      })
      .catch((err) => {
        console.warn('[GEF SaaS PWA] Registro do Service Worker falhou:', err);
      });
  });
}

// ==========================================
// 3. SEED INICIAL & REPOSITÓRIO LOCAL (DEMO / FALLBACK)
// ==========================================
const DEFAULT_EMPRESA_ID = 'e1a2b3c4-0001-4000-8000-000000000001';

const INITIAL_DB = {
  empresas: [
    { id: DEFAULT_EMPRESA_ID, nome: 'Distribuidora & Varejo GEF Matriz', nif: '54.321.987/0001-20', created_at: '2026-01-10T08:00:00Z' }
  ],
  empresas_status: [
    { empresa_id: DEFAULT_EMPRESA_ID, status: 'ativa', plano: 'pro', valor_plano: 2500.00, data_vencimento: '2026-10-15', ultimo_pagamento: '2026-09-01' }
  ],
  perfis: [
    { id: 'u-super-01', empresa_id: DEFAULT_EMPRESA_ID, nome: 'Carlos Eduardo Mendes', role: 'super_admin', telefone: '(11) 99111-2233', email: 'super@gef.com' },
    { id: 'u-admin-02', empresa_id: DEFAULT_EMPRESA_ID, nome: 'Mariana Silva Rocha', role: 'admin', telefone: '(11) 98222-3344', email: 'admin@gef.com' },
    { id: 'u-caixa-03', empresa_id: DEFAULT_EMPRESA_ID, nome: 'Lucas Almeida Dias', role: 'caixa', telefone: '(11) 97333-4455', email: 'caixa@gef.com' },
    { id: 'u-estoque-04', empresa_id: DEFAULT_EMPRESA_ID, nome: 'Roberto Santos Lima', role: 'estoquista', telefone: '(11) 96444-5566', email: 'estoquista@gef.com' },
    { id: 'u-embaixador-05', empresa_id: DEFAULT_EMPRESA_ID, nome: 'Fernanda Costa Rios', role: 'embaixador', telefone: '(11) 95555-6677', email: 'embaixador@gef.com' }
  ],
  clientes: [
    { id: 'cli-01', empresa_id: DEFAULT_EMPRESA_ID, embaixador_id: 'u-embaixador-05', nome: 'Supermercado Central Ltda', contato: '(11) 3322-1100', created_at: '2026-02-14T10:00:00Z' },
    { id: 'cli-02', empresa_id: DEFAULT_EMPRESA_ID, embaixador_id: 'u-embaixador-05', nome: 'Padaria e Confeitaria Bella Pão', contato: '(11) 3455-8899', created_at: '2026-03-01T11:20:00Z' },
    { id: 'cli-03', empresa_id: DEFAULT_EMPRESA_ID, embaixador_id: 'u-embaixador-05', nome: 'Restaurante Sabor Brasil', contato: '(11) 98777-6655', created_at: '2026-03-05T14:40:00Z' },
    { id: 'cli-04', empresa_id: DEFAULT_EMPRESA_ID, embaixador_id: null, nome: 'Mercadinho do Bairro Sol', contato: '(11) 99123-4567', created_at: '2026-03-08T09:15:00Z' }
  ],
  produtos: [
    { id: 'prod-01', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-001', nome: 'Café Especial Arábica Torrado 500g', estoque_atual: 48, estoque_minimo: 10, custo: 18.50, preco_venda: 32.90, margem_percentual: 77.8 },
    { id: 'prod-02', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-002', nome: 'Azeite de Oliva Extra Virgem 500ml', estoque_atual: 35, estoque_minimo: 8, custo: 24.00, preco_venda: 42.00, margem_percentual: 75.0 },
    { id: 'prod-03', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-003', nome: 'Chocolate Nobre 70% Cacau 200g', estoque_atual: 62, estoque_minimo: 15, custo: 8.20, preco_venda: 16.50, margem_percentual: 101.2 },
    { id: 'prod-04', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-004', nome: 'Queijo Canastra Curado Artesanal 1kg', estoque_atual: 18, estoque_minimo: 5, custo: 42.00, preco_venda: 69.90, margem_percentual: 66.4 },
    { id: 'prod-05', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-005', nome: 'Arroz Cateto Integral Orgânico 1kg', estoque_atual: 55, estoque_minimo: 12, custo: 6.50, preco_venda: 12.00, margem_percentual: 84.6 },
    { id: 'prod-06', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-006', nome: 'Vinho Tinto Cabernet Reserva 750ml', estoque_atual: 24, estoque_minimo: 6, custo: 38.00, preco_venda: 68.00, margem_percentual: 78.9 },
    { id: 'prod-07', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-007', nome: 'Mel Silvestre Puro Vidro 500g', estoque_atual: 29, estoque_minimo: 5, custo: 15.00, preco_venda: 28.50, margem_percentual: 90.0 },
    { id: 'prod-08', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-008', nome: 'Castanha de Caju Torrada s/ Sal 250g', estoque_atual: 40, estoque_minimo: 10, custo: 14.00, preco_venda: 24.90, margem_percentual: 77.8 },
    { id: 'prod-09', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-009', nome: 'Granola Artesanal Frutas e Nozes 400g', estoque_atual: 3, estoque_minimo: 8, custo: 9.80, preco_venda: 18.00, margem_percentual: 83.7 },
    { id: 'prod-10', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-010', nome: 'Suco de Uva Tinto Integral 1 Litro', estoque_atual: 50, estoque_minimo: 10, custo: 11.20, preco_venda: 19.90, margem_percentual: 77.7 },
    { id: 'prod-11', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-011', nome: 'Biscoito Amanteigado com Canela 300g', estoque_atual: 32, estoque_minimo: 10, custo: 5.50, preco_venda: 11.50, margem_percentual: 109.1 },
    { id: 'prod-12', empresa_id: DEFAULT_EMPRESA_ID, codigo: 'PROD-012', nome: 'Chá Orgânico Floral de Camomila 50g', estoque_atual: 4, estoque_minimo: 6, custo: 4.80, preco_venda: 9.90, margem_percentual: 106.2 }
  ],
  movimentacoes_estoque: [
    { id: 'mov-01', empresa_id: DEFAULT_EMPRESA_ID, produto_id: 'prod-01', tipo: 'entrada', quantidade: 50, custo_unitario: 18.50, preco_sugerido: 32.90, usuario_id: 'u-estoque-04', created_at: '2026-03-01T08:30:00Z' },
    { id: 'mov-02', empresa_id: DEFAULT_EMPRESA_ID, produto_id: 'prod-02', tipo: 'entrada', quantidade: 40, custo_unitario: 24.00, preco_sugerido: 42.00, usuario_id: 'u-estoque-04', created_at: '2026-03-02T09:15:00Z' }
  ],
  vendas: [
    { id: 'v-001', empresa_id: DEFAULT_EMPRESA_ID, cliente_id: 'cli-01', cliente_nome_avulso: null, cliente_contato_avulso: null, usuario_id: 'u-caixa-03', total: 174.60, forma_pagamento: 'pix', created_at: '2026-03-09T14:30:00Z' },
    { id: 'v-002', empresa_id: DEFAULT_EMPRESA_ID, cliente_id: null, cliente_nome_avulso: 'João Pedro Silveira', cliente_contato_avulso: '(11) 98111-9988', usuario_id: 'u-caixa-03', total: 65.80, forma_pagamento: 'cartao_credito', created_at: '2026-03-10T10:15:00Z' }
  ],
  itens_venda: [
    { id: 'iv-001', venda_id: 'v-001', produto_id: 'prod-01', quantidade: 3, preco_unitario: 32.90 },
    { id: 'iv-002', venda_id: 'v-001', produto_id: 'prod-03', quantidade: 4, preco_unitario: 16.50 },
    { id: 'iv-003', venda_id: 'v-002', produto_id: 'prod-01', quantidade: 2, preco_unitario: 32.90 }
  ],
  orcamentos: [
    { id: 'orc-01', empresa_id: DEFAULT_EMPRESA_ID, cliente_id: 'cli-02', total: 480.00, status: 'aberto' },
    { id: 'orc-02', empresa_id: DEFAULT_EMPRESA_ID, cliente_id: 'cli-03', total: 1250.00, status: 'aprovado' }
  ],
  contas_receber: [
    { id: 'cr-01', empresa_id: DEFAULT_EMPRESA_ID, cliente_id: 'cli-02', venda_id: null, valor_total: 890.00, valor_pago: 200.00, status: 'aberta' }
  ],
  comissoes: [
    { id: 'com-01', empresa_id: DEFAULT_EMPRESA_ID, embaixador_id: 'u-embaixador-05', venda_id: 'v-001', valor: 17.46, ciclo: '03/2026', status: 'pendente' },
    { id: 'com-02', empresa_id: DEFAULT_EMPRESA_ID, embaixador_id: 'u-embaixador-05', venda_id: 'v-antiga', valor: 35.00, ciclo: '02/2026', status: 'pago' }
  ],
  pagamentos_empresa: [
    { id: 'pag-01', empresa_id: DEFAULT_EMPRESA_ID, valor_pago: 2500.00, data_pagamento: '2026-08-10' },
    { id: 'pag-02', empresa_id: DEFAULT_EMPRESA_ID, valor_pago: 2500.00, data_pagamento: '2026-09-01' }
  ],
  auditoria: [
    { id: 'aud-01', empresa_id: DEFAULT_EMPRESA_ID, usuario_id: 'u-admin-02', acao: 'LOGIN_SISTEMA', tabela_afetada: 'perfis', registro_id: 'u-admin-02', detalhes: { ip: '127.0.0.1', agente: 'Navegador' }, created_at: '2026-03-10T08:00:00Z' }
  ]
};

// Carrega ou inicializa banco local
function getLocalDB() {
  const data = localStorage.getItem('GEF_STORAGE_DB');
  if (!data) {
    localStorage.setItem('GEF_STORAGE_DB', JSON.stringify(INITIAL_DB));
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DB;
  }
}

function saveLocalDB(db) {
  localStorage.setItem('GEF_STORAGE_DB', JSON.stringify(db));
}

// ==========================================
// 4. MÉTODOS DE SESSÃO & AUTENTICAÇÃO
// ==========================================
const GEF = {
  supabase,
  isLiveSupabase: isSupabaseConfigured && !!supabaseInstance,

  getCurrentUser() {
    const raw = localStorage.getItem('GEF_ACTIVE_USER');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(usuario, perfil) {
    const sessionData = {
      id: perfil.id,
      email: usuario?.email || perfil.email || `${perfil.role}@gef.com`,
      nome: perfil.nome,
      role: perfil.role,
      empresa_id: perfil.empresa_id || DEFAULT_EMPRESA_ID,
      telefone: perfil.telefone || '',
      auth_user_id: usuario?.id || perfil.id
    };
    localStorage.setItem('GEF_ACTIVE_USER', JSON.stringify(sessionData));
    return sessionData;
  },

  logout() {
    if (this.isLiveSupabase && supabaseInstance) {
      supabaseInstance.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('GEF_ACTIVE_USER');
    window.location.href = '/index.html';
  },

  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = '/index.html';
      return null;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Acesso não autorizado para o perfil: ${user.role}`);
      this.redirectByRole(user.role);
      return null;
    }
    return user;
  },

  redirectByRole(role) {
    switch (role) {
      case 'super_admin':
        window.location.href = '/super.html';
        break;
      case 'admin':
        window.location.href = '/admin.html';
        break;
      case 'caixa':
        window.location.href = '/caixa.html';
        break;
      case 'estoquista':
        window.location.href = '/estoquista.html';
        break;
      case 'embaixador':
        window.location.href = '/embaixador.html';
        break;
      default:
        window.location.href = '/index.html';
    }
  },

  // ==========================================
  // 5. ABSTRAÇÃO DE DADOS (SUPABASE REAL / FALLBACK DB)
  // ==========================================
  db: {
    async login(email, password) {
      // Se tiver Supabase ativo configurado
      if (GEF.isLiveSupabase && supabaseInstance) {
        try {
          const { data: authData, error: authError } = await supabaseInstance.auth.signInWithPassword({
            email,
            password
          });
          if (authError) throw authError;

          // Busca perfil correspondente ao id do usuário autenticado
          const { data: perfil, error: perfilError } = await supabaseInstance
            .from('perfis')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (perfilError) throw perfilError;
          return GEF.setCurrentUser(authData.user, perfil);
        } catch (err) {
          console.warn('[GEF SaaS] Supabase Auth falhou, verificando fallback local:', err);
          throw err;
        }
      }

      // Modo Local / Fallback demonstrativo
      const localDB = getLocalDB();
      const perfil = localDB.perfis.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!perfil) {
        throw new Error('Usuário ou senha inválidos. Verifique as credenciais.');
      }
      return GEF.setCurrentUser({ id: perfil.id, email: perfil.email }, perfil);
    },

    async getProdutos(empresa_id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance
          .from('produtos')
          .select('*')
          .eq('empresa_id', empresa_id)
          .order('nome', { ascending: true });
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.produtos.filter(p => !empresa_id || p.empresa_id === empresa_id);
    },

    async saveProduto(produto) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        if (produto.id) {
          const { data, error } = await supabaseInstance.from('produtos').update(produto).eq('id', produto.id).select().single();
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabaseInstance.from('produtos').insert(produto).select().single();
          if (error) throw error;
          return data;
        }
      }

      const localDB = getLocalDB();
      if (produto.id) {
        const idx = localDB.produtos.findIndex(p => p.id === produto.id);
        if (idx !== -1) {
          localDB.produtos[idx] = { ...localDB.produtos[idx], ...produto };
        }
      } else {
        produto.id = 'prod-' + Date.now();
        localDB.produtos.push(produto);
      }
      saveLocalDB(localDB);
      return produto;
    },

    async deleteProduto(id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { error } = await supabaseInstance.from('produtos').delete().eq('id', id);
        if (error) throw error;
        return true;
      }
      const localDB = getLocalDB();
      localDB.produtos = localDB.produtos.filter(p => p.id !== id);
      saveLocalDB(localDB);
      return true;
    },

    async getMovimentacoesEstoque(empresa_id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance
          .from('movimentacoes_estoque')
          .select('*, produtos(nome, codigo), perfis(nome)')
          .eq('empresa_id', empresa_id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.movimentacoes_estoque
        .filter(m => !empresa_id || m.empresa_id === empresa_id)
        .map(m => {
          const prod = localDB.produtos.find(p => p.id === m.produto_id);
          const usr = localDB.perfis.find(u => u.id === m.usuario_id);
          return { ...m, produtos: prod, perfis: usr };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async addMovimentacaoEstoque({ empresa_id, produto_id, tipo, quantidade, custo_unitario, preco_sugerido, usuario_id }) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        // Insere a movimentação
        const { data: mov, error: movErr } = await supabaseInstance
          .from('movimentacoes_estoque')
          .insert({
            empresa_id,
            produto_id,
            tipo,
            quantidade,
            custo_unitario,
            preco_sugerido,
            usuario_id
          })
          .select()
          .single();
        if (movErr) throw movErr;

        // Atualiza estoque atual, custo e preço de venda na tabela produtos
        const { data: prodData } = await supabaseInstance.from('produtos').select('estoque_atual').eq('id', produto_id).single();
        const novoEstoque = (prodData?.estoque_atual || 0) + (tipo === 'entrada' ? Number(quantidade) : -Number(quantidade));

        await supabaseInstance.from('produtos').update({
          estoque_atual: Math.max(0, novoEstoque),
          custo: custo_unitario,
          preco_venda: preco_sugerido
        }).eq('id', produto_id);

        // Registra Auditoria
        await GEF.db.registrarAuditoria({
          empresa_id,
          usuario_id,
          acao: 'ENTRADA_ESTOQUE',
          tabela_afetada: 'produtos',
          registro_id: produto_id,
          detalhes: { quantidade, custo_unitario, preco_sugerido }
        });

        return mov;
      }

      // Local Fallback
      const localDB = getLocalDB();
      const novoId = 'mov-' + Date.now();
      const novaMov = {
        id: novoId,
        empresa_id,
        produto_id,
        tipo,
        quantidade: Number(quantidade),
        custo_unitario: Number(custo_unitario),
        preco_sugerido: Number(preco_sugerido),
        usuario_id,
        created_at: new Date().toISOString()
      };
      localDB.movimentacoes_estoque.unshift(novaMov);

      // Atualiza produto
      const prod = localDB.produtos.find(p => p.id === produto_id);
      if (prod) {
        prod.estoque_atual = (prod.estoque_atual || 0) + Number(quantidade);
        prod.custo = Number(custo_unitario);
        prod.preco_venda = Number(preco_sugerido);
        if (prod.custo > 0) {
          prod.margem_percentual = Number((((prod.preco_venda - prod.custo) / prod.custo) * 100).toFixed(1));
        }
      }

      saveLocalDB(localDB);

      // Auditoria
      await GEF.db.registrarAuditoria({
        empresa_id,
        usuario_id,
        acao: 'ENTRADA_ESTOQUE',
        tabela_afetada: 'produtos',
        registro_id: produto_id,
        detalhes: { quantidade, custo_unitario, preco_sugerido }
      });

      return novaMov;
    },

    async registrarVenda({ empresa_id, cliente_id, cliente_nome_avulso, cliente_contato_avulso, usuario_id, total, forma_pagamento, itens }) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        // 1. Inserir em vendas
        const { data: venda, error: vError } = await supabaseInstance
          .from('vendas')
          .insert({
            empresa_id,
            cliente_id: cliente_id || null,
            cliente_nome_avulso: cliente_nome_avulso || null,
            cliente_contato_avulso: cliente_contato_avulso || null,
            usuario_id,
            total,
            forma_pagamento
          })
          .select()
          .single();
        if (vError) throw vError;

        // 2. Inserir em itens_venda (o trigger do Supabase baixa o estoque automaticamente)
        const itensPayload = itens.map(item => ({
          venda_id: venda.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }));
        const { error: ivError } = await supabaseInstance.from('itens_venda').insert(itensPayload);
        if (ivError) throw ivError;

        // 3. Se cliente tiver embaixador vinculado, criar comissão de 8%
        if (cliente_id) {
          const { data: cli } = await supabaseInstance.from('clientes').select('embaixador_id').eq('id', cliente_id).single();
          if (cli && cli.embaixador_id) {
            const comissaoValor = Number((total * 0.08).toFixed(2));
            const mesAno = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(new Date());
            await supabaseInstance.from('comissoes').insert({
              empresa_id,
              embaixador_id: cli.embaixador_id,
              venda_id: venda.id,
              valor: comissaoValor,
              ciclo: mesAno,
              status: 'pendente'
            });
          }
        }

        // 4. Salvar auditoria
        await GEF.db.registrarAuditoria({
          empresa_id,
          usuario_id,
          acao: 'NOVA_VENDA',
          tabela_afetada: 'vendas',
          registro_id: venda.id,
          detalhes: { total, forma_pagamento, itens_total: itens.length, cliente: cliente_nome_avulso || cliente_id }
        });

        return venda;
      }

      // Local Fallback
      const localDB = getLocalDB();
      const vendaId = 'v-' + Date.now();
      const novaVenda = {
        id: vendaId,
        empresa_id,
        cliente_id: cliente_id || null,
        cliente_nome_avulso: cliente_nome_avulso || null,
        cliente_contato_avulso: cliente_contato_avulso || null,
        usuario_id,
        total: Number(total),
        forma_pagamento,
        created_at: new Date().toISOString()
      };

      localDB.vendas.unshift(novaVenda);

      // Baixa estoque e adiciona itens
      itens.forEach((item, index) => {
        localDB.itens_venda.push({
          id: `iv-${Date.now()}-${index}`,
          venda_id: vendaId,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        });

        const prod = localDB.produtos.find(p => p.id === item.produto_id);
        if (prod) {
          prod.estoque_atual = Math.max(0, (prod.estoque_atual || 0) - item.quantidade);
        }
      });

      // Se houver cliente com embaixador
      if (cliente_id) {
        const cli = localDB.clientes.find(c => c.id === cliente_id);
        if (cli && cli.embaixador_id) {
          const comissaoValor = Number((total * 0.08).toFixed(2));
          const mesAno = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(new Date());
          localDB.comissoes.unshift({
            id: 'com-' + Date.now(),
            empresa_id,
            embaixador_id: cli.embaixador_id,
            venda_id: vendaId,
            valor: comissaoValor,
            ciclo: mesAno,
            status: 'pendente'
          });
        }
      }

      saveLocalDB(localDB);

      // Auditoria
      await GEF.db.registrarAuditoria({
        empresa_id,
        usuario_id,
        acao: 'NOVA_VENDA',
        tabela_afetada: 'vendas',
        registro_id: vendaId,
        detalhes: { total, forma_pagamento, itens_count: itens.length, cliente_nome_avulso }
      });

      return novaVenda;
    },

    async getVendas(empresa_id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance
          .from('vendas')
          .select('*, clientes(nome), perfis(nome), itens_venda(*, produtos(nome, codigo))')
          .eq('empresa_id', empresa_id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.vendas
        .filter(v => !empresa_id || v.empresa_id === empresa_id)
        .map(v => {
          const cli = localDB.clientes.find(c => c.id === v.cliente_id);
          const usr = localDB.perfis.find(u => u.id === v.usuario_id);
          const itens = localDB.itens_venda
            .filter(iv => iv.venda_id === v.id)
            .map(iv => ({
              ...iv,
              produtos: localDB.produtos.find(p => p.id === iv.produto_id)
            }));
          return {
            ...v,
            clientes: cli,
            perfis: usr,
            itens_venda: itens
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async getClientes(empresa_id, embaixador_id = null) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        let query = supabaseInstance.from('clientes').select('*, perfis:embaixador_id(nome)').order('nome', { ascending: true });
        if (empresa_id) query = query.eq('empresa_id', empresa_id);
        if (embaixador_id) query = query.eq('embaixador_id', embaixador_id);
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }

      const localDB = getLocalDB();
      return localDB.clientes
        .filter(c => {
          const matchEmpresa = !empresa_id || c.empresa_id === empresa_id;
          const matchEmbaixador = !embaixador_id || c.embaixador_id === embaixador_id;
          return matchEmpresa && matchEmbaixador;
        })
        .map(c => {
          const emb = localDB.perfis.find(p => p.id === c.embaixador_id);
          return { ...c, perfis: emb };
        });
    },

    async saveCliente(cliente) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        if (cliente.id) {
          const { data, error } = await supabaseInstance.from('clientes').update(cliente).eq('id', cliente.id).select().single();
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabaseInstance.from('clientes').insert(cliente).select().single();
          if (error) throw error;
          return data;
        }
      }

      const localDB = getLocalDB();
      if (cliente.id) {
        const idx = localDB.clientes.findIndex(c => c.id === cliente.id);
        if (idx !== -1) localDB.clientes[idx] = { ...localDB.clientes[idx], ...cliente };
      } else {
        cliente.id = 'cli-' + Date.now();
        cliente.created_at = new Date().toISOString();
        localDB.clientes.push(cliente);
      }
      saveLocalDB(localDB);
      return cliente;
    },

    async getOrcamentos(empresa_id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance
          .from('orcamentos')
          .select('*, clientes(nome)')
          .eq('empresa_id', empresa_id)
          .order('id', { ascending: false });
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.orcamentos.map(o => ({
        ...o,
        clientes: localDB.clientes.find(c => c.id === o.cliente_id)
      }));
    },

    async saveOrcamento(orc) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        if (orc.id) {
          const { data, error } = await supabaseInstance.from('orcamentos').update(orc).eq('id', orc.id).select().single();
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabaseInstance.from('orcamentos').insert(orc).select().single();
          if (error) throw error;
          return data;
        }
      }
      const localDB = getLocalDB();
      if (orc.id) {
        const idx = localDB.orcamentos.findIndex(o => o.id === orc.id);
        if (idx !== -1) localDB.orcamentos[idx] = { ...localDB.orcamentos[idx], ...orc };
      } else {
        orc.id = 'orc-' + Date.now();
        localDB.orcamentos.unshift(orc);
      }
      saveLocalDB(localDB);
      return orc;
    },

    async getComissoes(empresa_id, embaixador_id = null) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        let q = supabaseInstance.from('comissoes').select('*, perfis(nome), vendas(total, created_at)').order('id', { ascending: false });
        if (empresa_id) q = q.eq('empresa_id', empresa_id);
        if (embaixador_id) q = q.eq('embaixador_id', embaixador_id);
        const { data, error } = await q;
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.comissoes
        .filter(c => {
          const matchEmpresa = !empresa_id || c.empresa_id === empresa_id;
          const matchEmbaixador = !embaixador_id || c.embaixador_id === embaixador_id;
          return matchEmpresa && matchEmbaixador;
        })
        .map(c => {
          const emb = localDB.perfis.find(p => p.id === c.embaixador_id);
          const ven = localDB.vendas.find(v => v.id === c.venda_id);
          return { ...c, perfis: emb, vendas: ven };
        });
    },

    async pagarComissao(comissao_id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance
          .from('comissoes')
          .update({ status: 'pago' })
          .eq('id', comissao_id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      const item = localDB.comissoes.find(c => c.id === comissao_id);
      if (item) {
        item.status = 'pago';
        saveLocalDB(localDB);
      }
      return item;
    },

    async getPagamentosEmpresa(empresa_id = null) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        let q = supabaseInstance.from('pagamentos_empresa').select('*, empresas(nome, nif)').order('data_pagamento', { ascending: false });
        if (empresa_id) q = q.eq('empresa_id', empresa_id);
        const { data, error } = await q;
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.pagamentos_empresa
        .filter(p => !empresa_id || p.empresa_id === empresa_id)
        .map(p => ({
          ...p,
          empresas: localDB.empresas.find(e => e.id === p.empresa_id)
        }));
    },

    async registrarPagamentoEmpresa({ empresa_id, valor_pago, data_pagamento }) {
      const payload = {
        empresa_id,
        valor_pago: Number(valor_pago),
        data_pagamento: data_pagamento || new Date().toISOString().split('T')[0]
      };
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance.from('pagamentos_empresa').insert(payload).select().single();
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      payload.id = 'pag-' + Date.now();
      localDB.pagamentos_empresa.unshift(payload);
      saveLocalDB(localDB);
      return payload;
    },

    async getAuditoria(empresa_id) {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance
          .from('auditoria')
          .select('*, perfis(nome, role)')
          .eq('empresa_id', empresa_id)
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.auditoria
        .filter(a => !empresa_id || a.empresa_id === empresa_id)
        .map(a => ({
          ...a,
          perfis: localDB.perfis.find(p => p.id === a.usuario_id)
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async registrarAuditoria({ empresa_id, usuario_id, acao, tabela_afetada, registro_id, detalhes }) {
      const auditPayload = {
        empresa_id: empresa_id || DEFAULT_EMPRESA_ID,
        usuario_id: usuario_id || null,
        acao,
        tabela_afetada,
        registro_id: registro_id ? String(registro_id) : null,
        detalhes: detalhes || {}
      };

      if (GEF.isLiveSupabase && supabaseInstance) {
        try {
          await supabaseInstance.from('auditoria').insert(auditPayload);
        } catch (e) {
          console.warn('[GEF SaaS] Erro ao gravar auditoria no Supabase:', e);
        }
        return auditPayload;
      }

      const localDB = getLocalDB();
      auditPayload.id = 'aud-' + Date.now();
      auditPayload.created_at = new Date().toISOString();
      localDB.auditoria.unshift(auditPayload);
      saveLocalDB(localDB);
      return auditPayload;
    },

    async getEmpresas() {
      if (GEF.isLiveSupabase && supabaseInstance) {
        const { data, error } = await supabaseInstance.from('empresas').select('*, empresas_status(*)');
        if (error) throw error;
        return data;
      }
      const localDB = getLocalDB();
      return localDB.empresas.map(e => ({
        ...e,
        empresas_status: localDB.empresas_status.find(s => s.empresa_id === e.id)
      }));
    }
  },

  // ==========================================
  // 6. UTILITÁRIOS DE UI / FORMATADORES
  // ==========================================
  formatCurrency(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  },

  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  showToast(message, type = 'success') {
    const existing = document.getElementById('gef-toast-container');
    const container = existing || (() => {
      const c = document.createElement('div');
      c.id = 'gef-toast-container';
      c.style.position = 'fixed';
      c.style.bottom = '24px';
      c.style.right = '24px';
      c.style.zIndex = '9999';
      c.style.display = 'flex';
      c.style.flexDirection = 'column';
      c.style.gap = '10px';
      document.body.appendChild(c);
      return c;
    })();

    const toast = document.createElement('div');
    const bg = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';
    toast.style.background = bg;
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.3)';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.animation = 'fadeInToast 0.25s ease';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Torna GEF global para todos os scripts
window.GEF = GEF;
