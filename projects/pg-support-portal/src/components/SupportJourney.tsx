import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Headphones, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button, Panel } from './ui';
import { helpArticles } from './HelpCenter';
import { NewMerchantJourney } from './NewMerchantJourney';
import { ExistingMerchantJourney } from './ExistingMerchantJourney';

export type SupportGroup = 'customer' | 'new' | 'existing' | 'products';
export const existingIssues = ['Transaction failure or confirmation', 'Success-rate issue', 'Refund', 'Settlement', 'Reports', 'Account/dashboard', 'Other'];
export const newRequests = ['Partnership enquiry', 'Onboarding or KYC', 'Integration', 'Payment mode or product enablement', 'Commercials', 'Other'];
const routing: Record<string, string> = {
  'Partnership enquiry': 'Business team', Commercials: 'Business team',
  'Onboarding or KYC': 'Onboarding Ops', Integration: 'Integration help',
  'Payment mode or product enablement': 'Business team',
  Other: 'The appropriate destination needs to be confirmed from the details of your enquiry.',
};
const groupCopy: Record<SupportGroup, {title: string; description: string}> = {
  customer: {title: 'Customer who made a payment', description: 'Guidance for a payment you made to a business.'},
  new: {title: 'New merchant', description: 'Help with getting your business started with Pine Labs.'},
  existing: {title: 'Existing merchant', description: 'Use your Pine Labs dashboard to raise and manage Online PG support requests.'},
  products: {title: 'Other Pine Labs products', description: 'Find support for products beyond Online PG.'},
};
type Fields = Record<string, string>;
export type JourneyDrafts = { topics: Partial<Record<SupportGroup, string>>; fields: Record<string, Fields> };
export const emptyDrafts: JourneyDrafts = {topics: {}, fields: {}};
export function normalizeTopic(topic: string) {
  return ({'Refund information': 'Refund', 'Settlement information': 'Settlement', 'Success-rate issues': 'Success-rate issue', 'Account/dashboard access': 'Account/dashboard', Integrations: 'Integration', 'Payment mode and product enablement': 'Payment mode or product enablement'} as Record<string, string>)[topic] || topic;
}

// Only an authenticated host may provide this value, after server-side dashboard validation.
// The local app has no authentication service and leaves it false.
function OtherSupportJourney({ group, drafts, onDrafts, onHome, dashboardValidated = false }: {
  group: SupportGroup; drafts: JourneyDrafts; onDrafts: (drafts: JourneyDrafts) => void; onHome: () => void; dashboardValidated?: boolean;
}) {
  const [loginHelp, setLoginHelp] = useState(false);
  const [review, setReview] = useState(false);
  const [answerStep, setAnswerStep] = useState<'none' | 'answer' | 'resolved'>('none');
  const heading = useRef<HTMLHeadingElement>(null);
  const topic = drafts.topics[group] || '';
  const draftKey = `${group}:${loginHelp ? 'login-help' : topic}`;
  const fields = drafts.fields[draftKey] || {};
  const loginRequired = group === 'existing' && !dashboardValidated && !loginHelp;
  useEffect(() => { heading.current?.focus(); }, [group, topic, loginHelp, review, answerStep]);
  const answer = group === 'existing' && !loginHelp ? helpArticles.find(a => normalizeTopic(a.topic) === topic && a.path === 0) : undefined;
  const integrationGuide = helpArticles.find(a => a.id === 'integration-help');
  function chooseTopic(value: string) { onDrafts({...drafts, topics: {...drafts.topics, [group]: value}}); setReview(false); setAnswerStep('none'); }
  function change(name: string, value: string) { onDrafts({...drafts, fields: {...drafts.fields, [draftKey]: {...fields, [name]: value}}}); }
  function input(name: string, label: string, required = true, type = 'text', min?: string) {
    return <label className="support-field" key={name}>{label}{required ? ' *' : ' (optional)'}<input name={name} required={required} type={type} min={min} value={fields[name] || ''} onChange={e => change(name, e.target.value)} onBlur={e => {if(type === 'text') change(name, e.target.value.trim());}}/></label>;
  }
  const title = group === 'customer' ? 'Contact the business you paid' : group === 'products' ? 'Support for your product' : loginRequired ? 'Log in to your Pine Labs dashboard' : answerStep === 'resolved' ? 'Glad that helped' : answerStep === 'answer' ? 'Guidance for your issue' : review ? 'Your request details' : loginHelp ? 'Help with dashboard login' : topic || (group === 'new' ? 'Choose a request type' : 'Choose an issue category');
  return <section className="support-container flow-section"><button className="back-link" onClick={onHome}><ArrowLeft size={16}/> BACK</button><div className="flow-layout"><aside className="flow-aside"><span className="category-icon"><Headphones size={25}/></span><h1>{groupCopy[group].title}</h1><p>{groupCopy[group].description}</p><div className="privacy-note"><ShieldCheck size={20}/><span>Never include passwords, OTPs, full card details, identity documents or secret keys.</span></div></aside><Panel className="flow-panel">
    <h2 ref={heading} tabIndex={-1}>{title}</h2>
    {group === 'customer' ? <><p>Pine Labs provides payment services to businesses. For help with an order, payment or refund, contact the business, website or app where you made the payment.</p><div className="sample-answer"><h3>Keep these details handy</h3><p>Your order reference, payment date, amount and a short explanation of the issue will help the business check its records.</p></div><p>No PG Support ticket is created for this path.</p><Button onClick={onHome}>Back to support home</Button></> : group === 'products' ? <><p>This portal supports the Online Payment Gateway. For another Pine Labs product, use the support information supplied with that product or available through your existing product account.</p><p>We cannot direct you to a specific product team from this page. No request has been sent.</p><Button onClick={onHome}>Back to support home</Button></> : loginRequired ? <><p>Open your usual Pine Labs dashboard using the sign-in address supplied to your business. Sign in to raise a support request in your merchant account.</p><div className="sample-answer"><h3>Dashboard sign-in required</h3><p>This page cannot verify your dashboard session or open a verified sign-in destination. Continue in your existing dashboard; support issue categories require a validated merchant session.</p>{topic && <p>Your selected issue, <strong>{topic}</strong>, is kept while you arrange dashboard access.</p>}</div><Button onClick={() => {setLoginHelp(true); setReview(false);}}>I can’t log in<ArrowRight size={16}/></Button></> : answerStep === 'resolved' ? <><p>This interaction is closed. No support ticket was created.</p><div className="form-actions"><Button onClick={onHome}>Back to support home</Button><Button variant="secondary" onClick={() => {setAnswerStep('none'); chooseTopic('');}}>Get help with another issue</Button></div></> : answerStep === 'answer' && answer ? <><button className="back-link" onClick={() => setAnswerStep('none')}><ArrowLeft size={15}/> Back to your details</button><div className="sample-answer"><h3>{answer.title}</h3>{answer.sections.map(section => <p key={section.title}>{section.text}</p>)}</div><h3>Did this resolve your issue?</h3><p>No payment or account lookup has been performed. Your details are kept if you need further help.</p><div className="form-actions"><Button onClick={() => setAnswerStep('resolved')}>Yes, my issue is resolved</Button><Button variant="secondary" onClick={() => {setAnswerStep('none'); setReview(true);}}>No, continue with my request</Button></div></> : review ? <><p>Request: <strong>{loginHelp ? 'Account/dashboard — login help' : topic}</strong></p><p>Intended destination: <strong>{group === 'new' ? routing[topic] : 'Online PG Support'}</strong></p><dl className="request-review">{Object.entries(fields).filter(([,value]) => value).map(([key,value]) => <div key={key}><dt>{({payment:'Payment or order reference',refund:'Refund ID',settlement:'Settlement ID',mode:'Payment mode',period:'Affected date/time period',report:'Report type',from:'From date',to:'To date',specify:'Please specify',description:'Short description',business:'Business or merchant reference',error:'Login error'} as Record<string,string>)[key] || key}</dt><dd>{value}</dd></div>)}</dl><div className="sample-answer"><h3>Your next step</h3>{group === 'new' && <p>{topic === 'Integration' ? 'Continue through the integration support process supplied during onboarding, with your integration method, environment and error details. If you do not have those instructions, ask your existing business contact for the integration support route.' : `Share these details through your established business contact${routing[topic] === 'Business team' || routing[topic] === 'Onboarding Ops' ? ` for ${routing[topic]}` : ''}. A direct enquiry destination is not available on this page.`}</p>}<strong>No request has been sent.</strong><p>Your details remain on this page only. Online submission is not available here. Use your established business support channel, or your dashboard when you can access it, and include the details above.</p></div><div className="form-actions"><Button variant="secondary" onClick={() => setReview(false)}>Edit details</Button><Button onClick={onHome}>Back to support home</Button></div></> : !topic && !loginHelp ? <><p>Select the closest match. Your details are kept if you return to another topic.</p><div className="topic-list">{(group === 'new' ? newRequests : existingIssues).map(t => <button key={t} onClick={() => chooseTopic(t)}>{t}<ChevronRight size={17}/></button>)}</div></> : <>
      {loginHelp ? <><button className="back-link" onClick={() => {setLoginHelp(false); setReview(false);}}><ArrowLeft size={15}/> Back to dashboard sign-in guidance</button><p>Use the account-recovery options available on your usual dashboard sign-in page. If you are still unable to sign in, prepare the details below for your established business support channel. Do not share passwords or OTPs.</p></> : <button className="back-link" onClick={() => chooseTopic('')}><ArrowLeft size={15}/> Change {group === 'new' ? 'request type' : 'issue category'}</button>}
      {group === 'new' && <p>Destination: <strong>{routing[topic]}</strong></p>}
      {topic === 'Integration' && <p>Use the developer guidance supplied during onboarding if available. Describe your integration method, test or live environment, expected result and error message below. Remove credentials and personal information.</p>}
      {topic === 'Integration' && integrationGuide && <details className="integration-guidance"><summary>Read developer and integration guidance</summary>{integrationGuide.sections.map(section => <p key={section.title}>{section.text}</p>)}</details>}
      <p className="form-intro">Fields marked * are required.</p>
      <form onSubmit={e => {e.preventDefault(); if(answer) setAnswerStep('answer'); else setReview(true);}}><div className="fields-grid">
        {loginHelp && <>{input('business', 'Business or merchant reference', false)}{input('error', 'Login error or problem', false)}</>}
        {group === 'existing' && !loginHelp && <>
          {topic === 'Transaction failure or confirmation' && input('payment', 'Order ID or Payment ID')}
          {topic === 'Refund' && <>{input('payment', 'Payment ID')}{input('refund', 'Refund ID', false)}</>}
          {topic === 'Settlement' && input('settlement', 'Settlement ID', false)}
          {topic === 'Success-rate issue' && <><label className="support-field">Payment mode *<select required value={fields.mode || ''} onChange={e => change('mode',e.target.value)}><option value="">Select payment mode</option>{['UPI','Cards','Netbanking','Wallets','Other'].map(m => <option key={m}>{m}</option>)}</select></label>{input('period','Affected date/time period')}</>}
          {topic === 'Reports' && <><label className="support-field">Report type *<select required value={fields.report || ''} onChange={e => change('report',e.target.value)}><option value="">Select report type</option>{['Transaction','Refund','Settlement','Other'].map(r => <option key={r}>{r}</option>)}</select></label>{input('from','From date',true,'date')}{input('to','To date',true,'date',fields.from)}</>}
        </>}
        {group === 'new' && topic === 'Other' && input('specify','Please specify')}
      </div><label className="support-field">Short description *<textarea required rows={4} value={fields.description || ''} onChange={e => change('description',e.target.value)} onBlur={e => change('description',e.target.value.trim())} placeholder="Tell us what you need help with."/></label><p className="demo-note"><LockKeyhole size={14}/> Details stay on this page. No request is sent from this form.</p><Button type="submit">{answer ? 'Continue' : 'Review request details'}<ArrowRight size={16}/></Button></form>
    </>}
  </Panel></div></section>;
}

export function SupportJourney(props: Parameters<typeof OtherSupportJourney>[0]) {
  return props.group === 'new'
    ? <NewMerchantJourney drafts={props.drafts} onDrafts={props.onDrafts} onHome={props.onHome}/>
    : props.group === 'existing' ? <ExistingMerchantJourney drafts={props.drafts} onDrafts={props.onDrafts} onHome={props.onHome} dashboardValidated={props.dashboardValidated}/> : <OtherSupportJourney {...props}/>;
}
