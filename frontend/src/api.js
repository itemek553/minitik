export const API = 'https://minitik.onrender.com'  // <- Twój backend na Render

export async function listVideos() {
  const res = await fetch(`${API}/videos/list/`)
  return res.json()
}

export async function uploadVideo({ username, title, file }) {
  const fd = new FormData()
  fd.append('username', username)
  fd.append('title', title)
  fd.append('file', file)
  const res = await fetch(`${API}/videos/upload/`, { method: 'POST', body: fd })
  return res.json()
}

export async function likeVideo({ username, video_id }) {
  // backend expects form-encoded body for like in scaffold
  const body = `username=${encodeURIComponent(username)}&video_id=${encodeURIComponent(video_id)}`
  const res = await fetch(`${API}/videos/like/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  return res.json()
}

export async function likesCount(video_id) {
  const res = await fetch(`${API}/videos/likes_count/${video_id}`)
  return res.json()
}

export async function registerUsername(username) {
  const res = await fetch(`${API}/users/register/?username=${encodeURIComponent(username)}`, { method: 'POST' })
  return res.json()
}

export async function postComment({ username, video_id, text }) {
  const body = `username=${encodeURIComponent(username)}&video_id=${encodeURIComponent(video_id)}&text=${encodeURIComponent(text)}`
  const res = await fetch(`${API}/videos/comment/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  return res.json()
}
