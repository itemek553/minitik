import React, {useEffect, useState} from 'react'

const API = 'http://localhost:8000'

export default function App(){
  const [username, setUsername] = useState('')
  const [videos, setVideos] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')

  useEffect(()=>{ fetchVideos() }, [])

  async function fetchVideos(){
    const res = await fetch(API + '/videos/list/')
    const data = await res.json()
    setVideos(data)
  }

  async function register(){
    if(!username) return alert('Podaj nazwę użytkownika')
    const res = await fetch(API + '/users/register/?username=' + encodeURIComponent(username), {method: 'POST'})
    if(res.ok) alert('Zarejestrowano: ' + username)
    else alert('Błąd rejestracji')
  }

  async function upload(){
    if(!file || !title || !username) return alert('Wybierz plik, tytuł i ustaw użytkownika')
    const fd = new FormData()
    fd.append('username', username)
    fd.append('title', title)
    fd.append('file', file)
    const res = await fetch(API + '/videos/upload/', { method: 'POST', body: fd })
    if(res.ok){ alert('Wysłano!'); fetchVideos() }
    else alert('Błąd wysyłania')
  }

  async function like(video_id){
    await fetch(API + '/videos/like/', {method: 'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: 'username='+encodeURIComponent(username)+'&video_id='+video_id})
    alert('Lajk wysłany')
  }

  return (
    <div style={{maxWidth:800, margin:'auto', padding:20}}>
      <h1>MiniTik (darmowy prototyp)</h1>
      <div style={{marginBottom:20}}>
        <input placeholder='nazwa użytkownika' value={username} onChange={e=>setUsername(e.target.value)} />
        <button onClick={register}>Zarejestruj</button>
      </div>

      <div style={{border:'1px solid #ddd', padding:10, marginBottom:20}}>
        <h3>Prześlij film</h3>
        <input placeholder='tytuł' value={title} onChange={e=>setTitle(e.target.value)} />
        <input type='file' accept='video/*' onChange={e=>setFile(e.target.files[0])} />
        <button onClick={upload}>Wyślij</button>
      </div>

      <h2>Feed</h2>
      {videos.map(v=>(
        <div key={v.id} style={{border:'1px solid #eee', padding:10, marginBottom:10}}>
          <strong>{v.title}</strong><br/>
          <small>od: {v.user_id}</small>
          <div>
            <video width='320' controls src={API + '/videos/stream/' + v.filename}></video>
          </div>
          <div>
            <button onClick={()=>like(v.id)}>Lubię to</button>
          </div>
        </div>
      ))}
    </div>
  )
}
