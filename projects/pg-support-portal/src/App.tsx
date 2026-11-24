import { useState } from 'react';
import { ArrowRight, Building2, CreditCard, Layers3, Search, ShieldCheck, Store } from 'lucide-react';
import { HelpCenter, helpArticles } from './components/HelpCenter';
import { emptyDrafts, normalizeTopic, SupportJourney, type JourneyDrafts, type SupportGroup } from './components/SupportJourney';
import './support.css';

const groups: {id: SupportGroup; title: string; description: string; icon: typeof Store; hint: string}[] = [
  {id: 'customer', title: 'Customer who made a payment', description: 'Made a payment to a business? Find out who can help.', icon: CreditCard, hint: 'Find payment guidance'},
  {id: 'new', title: 'New merchant', description: 'Get help with onboarding, partnerships or your integration.', icon: Building2, hint: 'Explore your next steps'},
  {id: 'existing', title: 'Existing merchant', description: 'Use your merchant dashboard for payments, reports and account support.', icon: Store, hint: 'Get merchant support'},
];
export default function App() {
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visibleGroups = groups.filter(g => {
    const path = g.id === 'customer' ? 2 : g.id === 'new' ? 1 : 0;
    const content = [g.title,g.description,...helpArticles.filter(a=>a.path===path).map(a=>[a.title,a.question,a.category,a.summary].join(' '))].join(' ').toLowerCase();
    return words.every(word=>content.includes(word)||(word.endsWith('s')&&content.includes(word.slice(0,-1))));
  });
  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [drafts, setDrafts] = useState<JourneyDrafts>(emptyDrafts);
  function home() {setGroup(null); window.location.hash = 'main';}
  function selectGroup(next: SupportGroup) {
    setGroup(next); window.location.hash = 'main';
  }
  function browseHelp() {window.location.hash = 'help-articles'; document.getElementById('help-articles')?.scrollIntoView({block:'start'});}
  return <div className="support-app"><a className="skip-link" href="#main">Skip to content</a>
    <header className="support-header"><div className="support-container header-inner"><button className="support-brand" onClick={home} aria-label="Pine Labs Support home"><img src={`${import.meta.env.BASE_URL}payment-assets/pinelabs-online.svg`} alt="Pine Labs Online"/><span className="brand-divider"/><span>Support</span></button><nav aria-label="Main navigation">{group && group !== 'products' && <button className="header-link" onClick={browseHelp}>FAQs</button>}</nav></div></header>
    <main id="main">{group ? <>
      <SupportJourney key={group} group={group} drafts={drafts} onDrafts={setDrafts} onHome={home}/>
      {group !== 'products' && <>
        <HelpCenter key={group} bucket={group} onSupport={(path,topic)=>{const next: SupportGroup = path===0?'existing':path===1?'new':'customer';setDrafts(d=>({...d,topics:{...d.topics,[next]:normalizeTopic(topic)}}));setGroup(next);window.location.hash='main';}}/>
      </>}
    </> : <>
      <section className="support-hero"><div className="hero-orbit orbit-one" aria-hidden="true"/><div className="hero-orbit orbit-two" aria-hidden="true"/><div className="support-container hero-content"><h1>How can we help?</h1><p>Choose who needs support to find the right next step.</p><div className="support-search"><Search size={21} aria-hidden="true"/><label className="sr-only" htmlFor="topic-search">Search help topics</label><input id="topic-search" type="search" placeholder="Search payments, refunds, settlements…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="popular">Popular topics: {['Refunds','Settlements','Integrations'].map(t=><button key={t} onClick={()=>setQuery(t)}>{t}</button>)}</div></div></section>
      <section className="support-container audience-section" aria-labelledby="audience-title"><div className="section-top"><h2 id="audience-title" tabIndex={-1}>Who needs support?</h2></div><div className="audience-grid support-groups">{visibleGroups.map(g => <button key={g.id} className="audience-card" onClick={() => selectGroup(g.id)}><span className="category-icon"><g.icon size={25} strokeWidth={1.5}/></span><h3>{g.title}</h3><p>{g.id === 'customer' ? <>Made a payment to a business?<br/>Find out who can help.</> : g.description}</p><span className="card-link">{g.hint}<ArrowRight size={17}/></span></button>)}</div>{query.trim()&&<div className="home-search-feedback"><p role="status">{visibleGroups.length ? `${visibleGroups.length} support ${visibleGroups.length===1?'path':'paths'} found` : 'No matching topics. Try another search or browse all support paths.'}</p><button className="clear-search" onClick={()=>setQuery('')}>Clear search · Show all support paths</button></div>}<button className="other-product-link" onClick={() => selectGroup('products')}><Layers3 size={18}/> Need help with other Pine Labs products?<ArrowRight size={16}/></button></section>
      <section className="support-container reassurance"><span className="reassurance-icon"><ShieldCheck size={25}/></span><div><h3>The right details make all the difference.</h3><p>Keep your payment or order reference handy. It helps make your next step simpler.</p></div><span className="reassurance-line" aria-hidden="true"/></section>
    </>}</main><footer className="support-footer support-container"><span>© {new Date().getFullYear()} Pine Labs</span><span>Online PG Support <span className="footer-dot">·</span> Support guidance and request preparation.</span></footer>
  </div>;
}
