import { useRef, useState } from 'react';
import { FileImage, X } from 'lucide-react';
import { validateSupportImage } from '../services/newMerchantRequests';

export function ImageUpload({file,onChange,disabled=false}:{file?:File;onChange:(file:File|undefined)=>void;disabled?:boolean}) {
  const input=useRef<HTMLInputElement>(null);
  const [error,setError]=useState('');
  const [dragging,setDragging]=useState(false);
  function select(files:File[]){
    setDragging(false);
    if(disabled||!files.length)return;
    if(files.length>1){setError('Choose one image at a time.');return;}
    try{validateSupportImage(files[0]);onChange(files[0]);setError('');}
    catch(e){setError(e instanceof Error?e.message:'Choose a PNG or JPEG image up to 5 MB.');}
  }
  return <div className="support-image-upload">
    <input ref={input} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" hidden disabled={disabled} aria-label="Attach a support image" onChange={e=>{select(Array.from(e.currentTarget.files||[]));e.currentTarget.value='';}}/>
    <button type="button" disabled={disabled} className={`image-dropzone${dragging?' is-dragging':''}`} aria-describedby="image-upload-guidance" onClick={()=>input.current?.click()} onDragOver={e=>{e.preventDefault();if(!disabled)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();select(Array.from(e.dataTransfer.files));}}>
      <span className="image-upload-icon" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}support-assets/upload.svg`} alt=""/></span><span className="image-upload-copy"><strong>{file?'Replace documents':'Upload required documents'}</strong><span id="image-upload-guidance">Upload PNG or JPEG • Up to 5MB</span></span>
    </button>
    {file&&<div className="selected-upload"><FileImage size={19} aria-hidden="true"/><span role="status">{file.name} <small>({(file.size/1024/1024).toFixed(2)} MB)</small></span><button type="button" disabled={disabled} aria-label="Remove attached image" onClick={()=>{onChange(undefined);setError('');}}><X size={17}/></button></div>}
    {error&&<p className="upload-error" role="alert">{error}</p>}
  </div>;
}
