import { useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, BookImage, Check,
  ChevronDown, CircleHelp, Clock3, FileImage, FileText, Film,
  FolderKanban, Gauge, History, ImagePlus, LayoutDashboard, Library,
  Menu, MessageSquareText, Plus, Search, Settings2, ShieldCheck,
  Sparkles, WandSparkles, X
} from "lucide-react";

type Page = "Início" | "Criar texto" | "Criar imagem" | "Criar vídeo" | "Meus projetos" | "Biblioteca" | "Histórico" | "Créditos" | "Configurações";
type Notice = { title: string; message: string } | null;

const navItems: { label: Page; icon: typeof LayoutDashboard; group: string }[] = [
  { label: "Início", icon: LayoutDashboard, group: "WORKSPACE" },
  { label: "Criar texto", icon: FileText, group: "CRIAR" },
  { label: "Criar imagem", icon: FileImage, group: "CRIAR" },
  { label: "Criar vídeo", icon: Film, group: "CRIAR" },
  { label: "Meus projetos", icon: FolderKanban, group: "GERENCIAR" },
  { label: "Biblioteca", icon: Library, group: "GERENCIAR" },
  { label: "Histórico", icon: History, group: "GERENCIAR" },
  { label: "Créditos", icon: Activity, group: "CONTA" },
  { label: "Configurações", icon: Settings2, group: "CONTA" }
];

function App() {
  const [page, setPage] = useState<Page>("Início");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Profissional");
  const [goal, setGoal] = useState("Vender");
  const [contentType, setContentType] = useState("Descrição de produto");
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("1:1");
  const [videoFormat, setVideoFormat] = useState("Vertical (9:16)");
  const [search, setSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [copied, setCopied] = useState(false);

  const go = (next: Page) => {
    setPage(next);
    setMobileNav(false);
    setNotice(null);
  };

  const submitCreator = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    if (page === "Criar vídeo") {
      setNotice({ title: "Provedor de vídeo pendente", message: "Ainda não há um provedor de vídeo configurado. Nenhum vídeo foi gerado." });
      return;
    }
    setIsGenerating(true);
    try {
      const endpoint = page === "Criar texto" ? "/api/generate-text" : "/api/generate-image";
      const payload = page === "Criar texto" ? { product, audience, tone, goal, contentType } : { prompt, ratio };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir a geração.");
      if (page === "Criar texto" && typeof data.text === "string") {
        setGeneratedText(data.text);
        setNotice({ title: "Texto gerado", message: "O provedor retornou um texto real. Revise antes de publicar." });
      } else if (page === "Criar imagem" && typeof data.image === "string") {
        setGeneratedImage(data.image);
        setNotice({ title: "Imagem gerada", message: "O provedor retornou uma imagem real. Você pode baixá-la." });
      } else throw new Error("O provedor retornou um formato de resposta inesperado.");
    } catch (error) {
      setNotice({ title: "Não foi possível gerar", message: error instanceof Error ? error.message : "Ocorreu um erro inesperado." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyGeneratedText = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice({ title: "Cópia indisponível", message: "Selecione o texto da prévia e copie manualmente." });
    }
  };

  const showNotice = (title: string, message: string) => setNotice({ title, message });

  const pageTitle: Record<Page, string> = {
    "Início": "Seu espaço criativo",
    "Criar texto": "Criar conteúdo em texto",
    "Criar imagem": "Criar imagem com IA",
    "Criar vídeo": "Criar vídeo com IA",
    "Meus projetos": "Meus projetos",
    "Biblioteca": "Sua biblioteca",
    "Histórico": "Histórico de atividades",
    "Créditos": "Créditos e plano",
    "Configurações": "Configurações"
  };

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={21} strokeWidth={2.4} /></div>
          <span className="brand-name">capplay<span>.</span></span>
          <button className="icon-button mobile-close" aria-label="Fechar menu" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <button className="workspace-select" onClick={() => showNotice("Workspace", "A gestão de equipes será habilitada após a configuração de autenticação.")}>
          <span className="workspace-avatar">C</span>
          <span className="workspace-copy"><strong>Meu workspace</strong><small>Plano não configurado</small></span>
          <ChevronDown size={15} className="muted-icon" />
        </button>
        <nav className="side-nav" aria-label="Navegação principal">
          {["WORKSPACE", "CRIAR", "GERENCIAR", "CONTA"].map((group) => (
            <div className="nav-group" key={group}>
              <p className="nav-label">{group}</p>
              {navItems.filter((item) => item.group === group).map(({ label, icon: Icon }) => (
                <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => go(label)}>
                  <Icon size={17} strokeWidth={1.9} /><span>{label}</span>
                  {label === "Criar imagem" && <span className="new-dot" />}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <div><strong>Precisa de ajuda?</strong><p>Veja como começar com o Capplay.</p></div>
            <ArrowRight size={15} />
          </div>
          <div className="profile-row">
            <div className="profile-avatar">U</div>
            <div className="profile-copy"><strong>Usuário</strong><small>Conta não conectada</small></div>
            <button className="icon-button" aria-label="Configurações da conta" onClick={() => go("Configurações")}><Settings2 size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="search-box"><Search size={16} /><input aria-label="Pesquisar" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="icon-button notification-button" aria-label="Notificações" onClick={() => showNotice("Notificações", "Você não tem notificações novas.")}><Bell size={18} /></button>
            <button className="avatar-small" aria-label="Abrir configurações" onClick={() => go("Configurações")}>U</button>
          </div>
        </header>

        <div className="page-content">
          {notice && <div className="notice-banner" role="status"><div className="notice-symbol"><ShieldCheck size={19} /></div><div><strong>{notice.title}</strong><p>{notice.message}</p></div><button className="icon-button" aria-label="Fechar aviso" onClick={() => setNotice(null)}><X size={17} /></button></div>}
          {page === "Início" && <Dashboard go={go} showNotice={showNotice} />}
          {page === "Criar texto" && <CreatorHeader icon={<FileText size={21} />} eyebrow="GERADOR DE TEXTO" title={pageTitle[page]} description="Crie textos de produto e campanhas alinhados à sua marca." />}
          {page === "Criar texto" && <form className="creator-layout" onSubmit={submitCreator}>
            <section className="panel creator-form">
              <div className="panel-heading"><div><h2>Detalhes do conteúdo</h2><p>Descreva o que você quer comunicar.</p></div><span className="step-tag">ETAPA 1</span></div>
              <label>Tipo de conteúdo<select value={contentType} onChange={(e) => setContentType(e.target.value)}><option>Descrição de produto</option><option>Anúncio para redes sociais</option><option>Legenda para Instagram</option><option>E-mail de vendas</option><option>Título e descrição SEO</option><option>Roteiro para vídeo</option></select></label>
              <label>Produto ou serviço<input required minLength={2} value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex.: Garrafa térmica de aço inox" /></label>
              <label>Público-alvo<input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex.: Pessoas que praticam esportes" /></label>
              <div className="form-grid"><label>Tom de voz<select value={tone} onChange={(e) => setTone(e.target.value)}><option>Profissional</option><option>Amigável</option><option>Persuasivo</option><option>Descontraído</option><option>Premium</option></select></label><label>Objetivo<select value={goal} onChange={(e) => setGoal(e.target.value)}><option>Vender</option><option>Informar</option><option>Engajar</option><option>Gerar leads</option></select></label></div>
              <button className="primary-button full-button" type="submit" disabled={isGenerating}>{isGenerating ? <><span className="button-spinner" /> Gerando conteúdo...</> : <><WandSparkles size={17} /> Gerar texto <ArrowRight size={16} /></>}</button>
              <p className="form-footnote"><ShieldCheck size={14} /> A geração será ativada após conectar um provedor de IA.</p>
            </section>
            <section className="panel preview-panel"><div className="panel-heading"><div><h2>Prévia do resultado</h2><p>{generatedText ? "Resposta real do provedor conectado." : "Seu conteúdo aparecerá aqui."}</p></div>{generatedText && <button className="text-button" type="button" onClick={copyGeneratedText}><ArrowDownToLine size={14} /> {copied ? "Copiado" : "Copiar texto"}</button>}</div>{generatedText ? <div className="generated-result"><pre>{generatedText}</pre><p className="result-disclaimer">Revise os fatos e as informações do produto antes de publicar.</p></div> : <div className="empty-preview"><div className="preview-illustration"><MessageSquareText size={27} /></div><strong>Pronto para criar?</strong><p>Quando a API estiver configurada na Vercel, o texto gerado aparecerá aqui.</p><span className="status-pill"><span /> Aguardando geração</span></div>}</section>
          </form>}
          {page === "Criar imagem" && <><CreatorHeader icon={<ImagePlus size={21} />} eyebrow="GERADOR VISUAL" title={pageTitle[page]} description="Prepare instruções para imagens de produtos, anúncios e campanhas." /><form className="creator-layout" onSubmit={submitCreator}><section className="panel creator-form"><div className="panel-heading"><div><h2>Configurar imagem</h2><p>Descreva a imagem que deseja criar.</p></div><span className="step-tag">ETAPA 1</span></div><label>Descrição da imagem<textarea required minLength={8} rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex.: Foto de produto em estúdio, fundo claro, iluminação suave..." /></label><label>Proporção<select value={ratio} onChange={(e) => setRatio(e.target.value)}><option>1:1</option><option>4:5</option><option>3:2</option><option>16:9</option><option>9:16</option></select></label><div className="upload-placeholder"><ImagePlus size={21} /><strong>Imagem de referência (opcional)</strong><span>O envio de arquivos será habilitado na próxima etapa.</span></div><button className="primary-button full-button" type="submit" disabled={isGenerating}>{isGenerating ? <><span className="button-spinner" /> Gerando imagem...</> : <><WandSparkles size={17} /> Gerar imagem <ArrowRight size={16} /></>}</button><p className="form-footnote"><ShieldCheck size={14} /> A API precisa estar habilitada e configurada na Vercel.</p></section><section className="panel preview-panel"><div className="panel-heading"><div><h2>Prévia da imagem</h2><p>{generatedImage ? "Imagem retornada pelo provedor." : "Visualização do resultado final."}</p></div></div>{generatedImage ? <div className="generated-image-wrap"><img src={generatedImage} alt="Imagem gerada por IA" /><a className="secondary-button" href={generatedImage} download="capplay-imagem.png"><ArrowDownToLine size={15} /> Baixar imagem</a></div> : <div className="empty-preview"><div className="preview-illustration"><BookImage size={27} /></div><strong>Seu próximo visual começa aqui</strong><p>Defina o prompt e a proporção. A imagem real aparecerá aqui quando o provedor estiver configurado.</p><span className="status-pill"><span /> Aguardando geração</span></div>}</section></form></>}
          {page === "Criar vídeo" && <><CreatorHeader icon={<Film size={21} />} eyebrow="ESTÚDIO DE VÍDEO" title={pageTitle[page]} description="Organize o briefing do vídeo antes de conectar o serviço de geração." /><form className="creator-layout" onSubmit={submitCreator}><section className="panel creator-form"><div className="panel-heading"><div><h2>Briefing do vídeo</h2><p>Defina a ideia principal do seu vídeo.</p></div><span className="step-tag">ETAPA 1</span></div><label>Ideia ou roteiro<textarea required minLength={8} rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva as cenas, produto, estilo e mensagem..." /></label><label>Formato<select value={videoFormat} onChange={(e) => setVideoFormat(e.target.value)}><option>Vertical (9:16)</option><option>Quadrado (1:1)</option><option>Horizontal (16:9)</option></select></label><div className="info-card"><Film size={18} /><p><strong>Duração e modelo</strong><br />Serão exibidos quando o provedor conectado confirmar quais opções suporta.</p></div><button className="primary-button full-button" type="submit"><Film size={17} /> Verificar integração <ArrowRight size={16} /></button><p className="form-footnote"><ShieldCheck size={14} /> Geração de vídeo ainda não está disponível.</p></section><section className="panel preview-panel"><div className="panel-heading"><div><h2>Prévia do vídeo</h2><p>Seu resultado aparecerá nesta área.</p></div></div><div className="empty-preview"><div className="preview-illustration"><Film size={27} /></div><strong>Transforme uma ideia em vídeo</strong><p>Prepare seu briefing agora. A geração e a exportação serão habilitadas após a integração do provedor.</p><span className="status-pill"><span /> Aguardando integração</span></div></section></form></>}
          {page === "Meus projetos" && <EmptyPage icon={<FolderKanban size={25} />} title="Seus projetos ficarão aqui" description="Quando a persistência estiver conectada, você poderá organizar criações, editar versões e continuar de onde parou." action="Criar um texto" onAction={() => go("Criar texto")} />}
          {page === "Biblioteca" && <EmptyPage icon={<Library size={25} />} title="Sua biblioteca está pronta para começar" description="Imagens, vídeos e arquivos gerados aparecerão aqui depois que o armazenamento privado for configurado." action="Criar uma imagem" onAction={() => go("Criar imagem")} />}
          {page === "Histórico" && <EmptyPage icon={<Clock3 size={25} />} title="Nenhuma atividade registrada" description="O histórico será preenchido com tarefas reais após a integração do backend e dos provedores de criação." />}
          {page === "Créditos" && <><CreatorHeader icon={<Activity size={21} />} eyebrow="PLANO E CONSUMO" title={pageTitle[page]} description="A área de créditos será conectada ao sistema de cobrança depois que os serviços de geração forem testados." /><section className="panel billing-panel"><div className="billing-status"><div className="status-icon"><ShieldCheck size={22} /></div><div><h2>Cobrança ainda não configurada</h2><p>Não há plano ativo nem saldo de créditos confirmado para esta conta.</p></div><span className="status-pill"><span /> Pendente</span></div><div className="billing-divider" /><div className="billing-grid"><div><span>Plano atual</span><strong>Não configurado</strong></div><div><span>Créditos disponíveis</span><strong>—</strong></div><div><span>Próxima cobrança</span><strong>—</strong></div></div><button className="secondary-button" onClick={() => go("Configurações")}>Ver configurações <ArrowRight size={16} /></button></section></>}
          {page === "Configurações" && <><CreatorHeader icon={<Settings2 size={21} />} eyebrow="PREFERÊNCIAS" title={pageTitle[page]} description="Gerencie integrações e preferências do workspace." /><div className="settings-stack"><section className="panel settings-panel"><div className="settings-leading"><div className="settings-icon"><Sparkles size={19} /></div><div><h2>Provedores de IA</h2><p>Conecte os serviços de texto, imagem e vídeo para ativar as gerações.</p></div></div><div className="settings-trailing"><span className="status-pill"><span /> Não configurado</span><button className="secondary-button" onClick={() => showNotice("Integração pendente", "A configuração segura dos provedores será implementada no backend. Nenhuma chave deve ser inserida nesta interface ainda.")}>Configurar</button></div></section><section className="panel settings-panel"><div className="settings-leading"><div className="settings-icon"><ShieldCheck size={19} /></div><div><h2>Conta e segurança</h2><p>Login, perfil e isolamento dos seus dados dependem da configuração de autenticação.</p></div></div><span className="status-pill"><span /> Pendente</span></section><section className="panel settings-panel"><div className="settings-leading"><div className="settings-icon"><FolderKanban size={19} /></div><div><h2>Armazenamento</h2><p>Biblioteca e histórico exigem armazenamento privado e políticas de acesso por usuário.</p></div></div><span className="status-pill"><span /> Pendente</span></section></div></>}
          <footer className="page-footer"><span>© 2026 Capplay</span><span>Feito para criar melhor, com clareza.</span><button onClick={() => showNotice("Status do sistema", "Esta versão é a base inicial de interface. Autenticação, armazenamento, geração e cobrança ainda precisam ser implementados e testados.")}>Status do sistema <span className="footer-status-dot" /></button></footer>
        </div>
      </main>
    </div>
  );
}

function Dashboard({ go, showNotice }: { go: (page: Page) => void; showNotice: (title: string, message: string) => void }) {
  const quickActions: { title: string; description: string; icon: typeof FileText; color: string; page: Page }[] = [
    { title: "Criar texto", description: "Descrições, anúncios e legendas", icon: FileText, color: "blue", page: "Criar texto" },
    { title: "Criar imagem", description: "Visuais para produtos e campanhas", icon: ImagePlus, color: "violet", page: "Criar imagem" },
    { title: "Criar vídeo", description: "Roteiros e ideias para vídeos", icon: Film, color: "orange", page: "Criar vídeo" }
  ];
  return <>
    <section className="welcome-banner"><div className="welcome-content"><div className="welcome-kicker"><span className="sparkle-dot"><Sparkles size={13} /></span> SEU ESTÚDIO CRIATIVO</div><h1>Boas ideias merecem<br /><span>grandes criações.</span></h1><p>Seu espaço para preparar conteúdo de marketing, imagens e vídeos para sua marca.</p><button className="welcome-button" onClick={() => go("Criar texto")}>Começar a criar <ArrowRight size={16} /></button></div><div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-glow" /><div className="art-card art-card-back"><ImagePlus size={20} /><span>Imagem</span><div className="art-skeleton" /></div><div className="art-card art-card-front"><div className="art-spark"><Sparkles size={23} /></div><strong>Crie sem limites</strong><span>Uma ideia de cada vez.</span><div className="art-progress"><i /></div></div><div className="art-floating"><WandSparkles size={18} /></div></div></section>
    <div className="section-heading"><div><h2>O que vamos criar hoje?</h2><p>Escolha uma ferramenta para começar.</p></div><span className="section-caption"><Sparkles size={14} /> FERRAMENTAS CRIATIVAS</span></div>
    <div className="quick-grid">{quickActions.map(({ title, description, icon: Icon, color, page }) => <button className="quick-card" key={title} onClick={() => go(page)}><div className={`quick-icon ${color}`}><Icon size={21} /></div><div className="quick-card-copy"><h3>{title}</h3><p>{description}</p></div><span className="quick-arrow"><ArrowRight size={17} /></span></button>)}</div>
    <div className="dashboard-lower"><section className="panel recent-panel"><div className="panel-heading"><div><h2>Projetos recentes</h2><p>Continue trabalhando nas suas criações.</p></div><button className="text-button" onClick={() => go("Meus projetos")}>Ver todos <ArrowRight size={15} /></button></div><div className="empty-projects"><div className="empty-project-icon"><FolderKanban size={22} /></div><strong>Seu primeiro projeto começa aqui</strong><p>Você ainda não tem projetos salvos. Crie seu primeiro conteúdo para dar início à sua biblioteca criativa.</p><button className="secondary-button" onClick={() => go("Criar texto")}><Plus size={16} /> Novo projeto</button></div></section><section className="panel setup-panel"><div className="panel-heading"><div><h2>Preparando seu estúdio</h2><p>Etapas para ativar o Capplay.</p></div><span className="setup-count">0/3</span></div><div className="setup-list"><div className="setup-item"><span className="setup-step"><Check size={13} /></span><div><strong>Interface inicial</strong><p>Painel e formulários básicos</p></div><span className="setup-state done">Base criada</span></div><div className="setup-item"><span className="setup-step pending">2</span><div><strong>Conectar serviços</strong><p>Autenticação e provedores reais</p></div><span className="setup-state">Pendente</span></div><div className="setup-item"><span className="setup-step pending">3</span><div><strong>Testar e ativar</strong><p>Persistência, geração e segurança</p></div><span className="setup-state">Pendente</span></div></div><button className="setup-link" onClick={() => go("Configurações")}>Ver configurações <ArrowRight size={15} /></button></section></div>
    <div className="honesty-note"><ShieldCheck size={17} /><p><strong>Transparência desde o início.</strong> A interface está em construção. Nenhuma geração, cobrança ou conexão de conta será apresentada como ativa antes de ser integrada e testada.</p><button className="icon-button" aria-label="Saiba mais" onClick={() => showNotice("Sobre esta versão", "Esta é a primeira estrutura do front-end. O próximo passo é configurar backend seguro, autenticação, armazenamento e provedores reais.")}><ArrowRight size={16} /></button></div>
  </>;
}

function CreatorHeader({ icon, eyebrow, title, description }: { icon: ReactNode; eyebrow: string; title: string; description: string }) {
  return <div className="creator-page-heading"><div className="creator-page-icon">{icon}</div><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function EmptyPage({ icon, title, description, action, onAction }: { icon: ReactNode; title: string; description: string; action?: string; onAction?: () => void }) {
  return <><CreatorHeader icon={icon} eyebrow="SEU WORKSPACE" title={title} description={description} /><section className="panel empty-page-panel"><div className="empty-page-icon">{icon}</div><h2>{title}</h2><p>{description}</p>{action && onAction && <button className="primary-button" onClick={onAction}>{action} <ArrowRight size={16} /></button>}</section></>;
}

export default App;