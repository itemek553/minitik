import React, { useEffect, useState, useRef } from 'react'
import { listVideos, uploadVideo, likeVideo, likesCount, registerUsername, postComment } from './api'

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('mt_username') || '')
  const [videos, setVideos] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  useEffect(()=> {
    fetchVideos()
    // restore scroll pos if saved
    const saved = localStorage.getItem('mt_scroll_index')
    if (saved) setActiveIndex(Number(saved))
  }, [])

  useEffect(()=>{
    // save username persistently
    if (username) localStorage.setItem('mt_username', username)
  }, [username])

  async function fetchVideos(){
    try {
      const data = await listVideos()
      setVideos(data)
      // reset active index if needed
      if (data.length === 0) setActiveIndex(0)
    } catch(e){
      console.error(e)
      alert('Błąd przy pobieraniu filmów')
    }
  }

  async function doRegister(){
    if(!username) return alert('Podaj nazwę użytkownika')
    try {
      await registerUsername(username)
      alert('Zarejestrowano: ' + username)
    } catch(e){
      alert('Błąd rejestracji')
    }
  }

  async function doUpload(){
    if(!file || !title || !username) return alert('Wybierz plik, tytuł i ustaw użytkownika')
    try {
      await uploadVideo({ username, title, file })
      setFile(null); setTitle('')
      fetchVideos()
      alert('Film przesłany!')
    } catch(e){
      console.error(e)
      alert('Błąd wysyłania')
    }
  }

  async function doLike(video) {
    if(!username) return alert('Najpierw ustaw nazwę użytkownika')
    try {
      await likeVideo({ username, video_id: video.id })
      // update like count locally
      const res = await likesCount(video.id)
      setVideos(v=>v.map(x=> x.id===video.id ? {...x, likes_count: res.count} : x))
    } catch(e){
      console.error(e)
    }
  }

  function observeVideos() {
    const options = { root: null, rootMargin: '0px', threshold: 0.6 }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const vid = e.target.querySelector('video')
        if (e.isIntersecting) {
          vid && vid.play().catch(()=>{})
          const idx = Number(e.target.dataset.index)
          setActiveIndex(idx)
          localStorage.setItem('mt_scroll_index', String(idx))
        } else {
          vid && vid.pause()
        }
      })
    }, options)

    const nodes = containerRef.current?.querySelectorAll('.video-card') || []
    nodes.forEach(n => observer.observe(n))
  }

  useEffect(()=>{
    // observe after render
    observeVideos()
    // re-observe when videos change
  }, [videos])

  async function refreshLikesAll(){
    const copies = [...videos]
    for (let i=0;i<copies.length;i++){
      try {
        const res = await likesCount(copies[i].id)
        copies[i].likes_count = res.count
      } catch(e){}
    }
    setVideos(copies)
  }

  useEffect(()=>{
    // initial likes fetch
    refreshLikesAll()
  }, [videos.length])

  // comments: simple UI to post a comment (list not available unless backend extended)
  async function submitComment(video_id, textInputId) {
    const text = document.getElementById(textInputId).value
    if (!username) return alert('Ustaw najpierw nazwę użytkownika')
    if (!text) return
    try {
      await postComment({ username, video_id, text })
      document.getElementById(textInputId).value = ''
      alert('Komentarz wysłany (backend zapisze go, ale lista komentarzy nie jest jeszcze wyświetlana).')
    } catch(e){
      console.error(e)
      alert('Błąd wysyłania komentarza')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input placeholder="Twoja nazwa" value={username} onChange={e=>setUsername(e.target.value)} />
          <button onClick={doRegister}>Zarejestruj</button>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <small>Filmy: {videos.length}</small>
          <button onClick={fetchVideos}>Odśwież</button>
        </div>
      </header>

      <main ref={containerRef} className="feed">
        <aside className="upload">
          <h3>Prześlij film</h3>
          <input placeholder="Tytuł" value={title} onChange={e=>setTitle(e.target.value)} />
          <input type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])} />
          <button onClick={doUpload}>Prześlij</button>
        </aside>

        <section className="videos">
          {videos.length===0 && <div className="empty">Brak filmów — dodaj pierwszy!</div>}
          {videos.map((v, idx) => (
            <div className="video-card" key={v.id} data-index={idx}>
              <div className="video-meta">
                <strong>{v.title}</strong>
                <div>od: {v.user_id}</div>
              </div>
              <video
                src={`${(window.location.protocol==='file:'?'https://minitik.onrender.com': '')}/videos/stream/${v.filename}`}
                controls
                playsInline
                preload="metadata"
                muted
              />
              <div className="video-actions">
                <button onClick={()=>doLike(v)}>❤ Lubię to ({v.likes_count ?? 0})</button>
              </div>

              <div className="comments">
                <input id={`c-${v.id}`} placeholder="Napisz komentarz..." />
                <button onClick={()=>submitComment(v.id, `c-${v.id}`)}>Wyślij</button>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="foot">
        <small>MiniTik — prototyp. Backend: minitik.onrender.com</small>
      </footer>
    </div>
  )
}
