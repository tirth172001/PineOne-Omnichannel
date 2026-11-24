import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown, ChevronRight, Headphones, Loader2, ShieldCheck } from 'lucide-react';
import { Button, Panel } from './ui';
import { ImageUpload } from './ImageUpload';
import { helpArticles } from './HelpCenter';
import type { JourneyDrafts } from './SupportJourney';
import { newMerchantDestinations, newMerchantRequestTypes, submitNewMerchantRequest, type NewMerchantReceipt, type NewMerchantRequest, type NewMerchantRequestType, type NewMerchantSubmissionAdapter } from '../services/newMerchantRequests';

const phoneCountries = [
  {id:'IN',label:'🇮🇳 India',code:'+91'},
  {id:'US',label:'🇺🇸 United States',code:'+1'},
  {id:'GB',label:'🇬🇧 United Kingdom',code:'+44'},
  {id:'AE',label:'🇦🇪 United Arab Emirates',code:'+971'},
  {id:'SG',label:'🇸🇬 Singapore',code:'+65'},
  {id:'AU',label:'🇦🇺 Australia',code:'+61'},
];
export function NewMerchantJourney({drafts,onDrafts,onHome,submitRequest = submitNewMerchantRequest}:{drafts:JourneyDrafts;onDrafts:(drafts:JourneyDrafts)=>void;onHome:()=>void;submitRequest?:NewMerchantSubmissionAdapter}) {
  const topic = drafts.topics.new || '';
  const key = `new:${topic}`;
  const fields = drafts.fields[key] || {};
  const [receipt,setReceipt] = useState<NewMerchantReceipt | null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [attachments,setAttachments] = useState<Record<string,File|undefined>>({});
  const submitting = useRef(false);
  const autofilled = useRef(new Set<string>());
  const phoneCountry = phoneCountries.find(c=>c.id===fields.country) || phoneCountries[0];
  const heading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(()=>{heading.current?.focus();},[topic,receipt]);
  useEffect(()=>{if(error) errorRef.current?.focus();},[error]);
  function change(name:string,value:string){onDrafts({...drafts,fields:{...drafts.fields,[key]:{...fields,[name]:value}}});setError('');}
  function choose(value:string){onDrafts({...drafts,topics:{...drafts.topics,new:value}});setReceipt(null);setError('');}
  function fillOnFocus(){
    if(autofilled.current.has(key)) return;
    autofilled.current.add(key);
    onDrafts({...drafts,fields:{...drafts.fields,[key]:{...fields,contactName:'Sample Contact',businessName:'Sample Business',email:'contact@example.com',phone:'2025550123',country:fields.country||'IN'}}});
    setError('');
  }
  async function submit(){
    if(submitting.current) return;
    submitting.current = true;setBusy(true);setError('');
    try{
      const request:NewMerchantRequest={type:topic as NewMerchantRequestType,contactName:(fields.contactName||'').trim(),businessName:(fields.businessName||'').trim(),email:(fields.email||'').trim(),phone:`${phoneCountry.code} ${(fields.phone||'').trim()}`,description:(fields.description||'').trim(),...(attachments[key]?{attachment:attachments[key]}:{})};
      setReceipt(await submitRequest(request));
    }catch(e){setError(e instanceof Error?e.message:'We couldn’t accept your request. Please try again.');}
    finally{submitting.current=false;setBusy(false);}
  }
  function input(name:string,label:string,type='text',autoComplete?:string){return <label className="support-field">{label} <span className="required-asterisk" aria-hidden="true">*</span><input name={name} required type={type} autoComplete={autoComplete} value={fields[name]||''} pattern={type==='tel'?String.raw`[+0-9\(\) .\-]{7,25}`:type==='email'?'[^\\s@]+@[^\\s@]+\\.[^\\s@]+':'.*\\S.*'} onChange={e=>change(name,e.target.value)} /></label>;}
  const guide = helpArticles.find(a=>a.id==='integration-help');
  return <section className="support-container flow-section"><button className="back-link" onClick={onHome} disabled={busy}><ArrowLeft size={16}/> BACK</button><div className="flow-layout"><aside className="flow-aside"><span className="category-icon"><Headphones size={25}/></span><h1>New merchant</h1><p>Help with getting your business started with Pine Labs.</p><div className="privacy-note"><ShieldCheck size={20}/><span>Never include passwords, OTPs, full card details, identity documents or secret keys.</span></div></aside><Panel className="flow-panel">{topic&&!receipt&&<button className="back-link" disabled={busy} onClick={()=>choose('')}><ArrowLeft size={15}/> Change request type</button>}<div className={receipt ? "merchant-success-heading" : undefined}>{receipt&&<span className="merchant-success-check" aria-hidden="true"><Check size={22} strokeWidth={3}/></span>}<h2 ref={heading} tabIndex={-1}>{receipt?'Request sent':topic||'Choose a request type'}</h2></div>
    {receipt?<><dl className="merchant-confirmation-grid"><div><dt>Request type</dt><dd>{receipt.request.type}</dd></div><div><dt>Intended destination</dt><dd>{receipt.destination}</dd></div>{receipt.reference&&<div><dt>Request reference</dt><dd>{receipt.reference}</dd></div>}<div><dt>Contact name</dt><dd>{receipt.request.contactName}</dd></div><div><dt>Business name</dt><dd>{receipt.request.businessName}</dd></div><div><dt>Work email</dt><dd>{receipt.request.email}</dd></div><div><dt>Phone number</dt><dd>{receipt.request.phone}</dd></div>{receipt.request.description&&<div className="merchant-confirmation-description"><dt>Description</dt><dd>{receipt.request.description}</dd></div>}{receipt.request.attachment&&<div className="merchant-confirmation-description"><dt>Attached image</dt><dd>{receipt.request.attachment.name}</dd></div>}</dl><div className="sample-answer"><h3>What happens next?</h3>{receipt.delivery==='session'?<p>Your request has been accepted in this session for {receipt.destination}. Keep a copy of these details for follow-up through your established business contact.</p>:<p>Use {receipt.reference?'your request reference and ':''}the contact details above for follow-up with {receipt.destination}.</p>}{receipt.request.type==='Integration'&&<p>Keep your integration method, environment and error details handy. <a className="developer-help-link" href="#new-merchant-developer-help">Read developer help</a> before your next step.</p>}</div><div className="form-actions"><Button onClick={onHome}>Back to support home</Button></div></>:!topic?<><p>Select the closest match. Your details are kept if you change request type.</p><div className="topic-list">{newMerchantRequestTypes.map(t=><button key={t} onClick={()=>choose(t)}>{t}<ChevronRight size={17}/></button>)}</div></>:<><p>Destination: <strong>{newMerchantDestinations[topic as NewMerchantRequestType]}</strong></p>{topic==='Integration'&&<p>Describe your integration method, test or live environment and any error message. <a className="developer-help-link" href="#new-merchant-developer-help">Read developer help</a> or submit your integration request below.</p>}<form onFocusCapture={fillOnFocus} onSubmit={e=>{e.preventDefault();void submit();}} aria-busy={busy}><fieldset disabled={busy} className="new-merchant-fields"><div className="fields-grid new-merchant-contact-grid">{input('contactName','Contact name','text','name')}{input('businessName','Business name','text','organization')}{input('email','Work email','email','email')}<div className="support-field"><label htmlFor="new-merchant-phone">Phone number <span className="required-asterisk" aria-hidden="true">*</span></label><div className="merchant-phone-field"><div className="phone-country-picker"><span aria-hidden="true" className="phone-country-flag">{phoneCountry.label.split(' ')[0]}</span><ChevronsUpDown size={14} aria-hidden="true"/><select aria-label="Phone country and calling code" value={phoneCountry.id} onChange={e=>change('country',e.target.value)}>{phoneCountries.map(c=><option key={c.id} value={c.id} aria-label={`${c.label} ${c.code}`}>{c.label} {c.code}</option>)}</select></div><span className="phone-dial-code" aria-hidden="true">{phoneCountry.code}</span><input placeholder="00000 00000" id="new-merchant-phone" name="phone" aria-label="Phone number" required type="tel" autoComplete="tel-national" inputMode="tel" pattern={String.raw`[0-9\(\) .\-]{7,20}`} value={fields.phone||''} onChange={e=>change('phone',e.target.value)}/></div></div></div><ImageUpload key={key} file={attachments[key]} disabled={busy} onChange={file=>setAttachments(current=>({...current,[key]:file}))}/><label className="support-field">Description <span className="optional">(optional)</span><textarea name="description" rows={4} value={fields.description||''} onChange={e=>change('description',e.target.value)} onBlur={e=>change('description',e.target.value.trim())} /></label>{error&&<p role="alert" ref={errorRef} tabIndex={-1} className="submission-error">{error}</p>}<Button type="submit" disabled={busy}>{busy?<><Loader2 size={16} className="animate-spin"/> Sending request…</>:<>Send request<ArrowRight size={16}/></>}</Button></fieldset></form></>}
    {(topic==='Integration'||receipt?.request.type==='Integration')&&guide&&<section id="new-merchant-developer-help" className="integration-guidance" aria-labelledby="developer-help-title"><h3 id="developer-help-title">Developer and integration help</h3>{guide.sections.map(s=><div key={s.title}><h4>{s.title}</h4><p>{s.text}</p></div>)}</section>}
  </Panel></div></section>;
}
